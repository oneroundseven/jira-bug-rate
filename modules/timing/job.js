// Copyright 2018 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */
process.env.DEBUG = 'jira:*';

const sql = require('../../config/sql-jira');
const moment = require('moment');
const mongoDB = require('../mongodb');
const request = require('../jiraFilter/request');
const jiraData = require('../jiraFilter/data');
const debug = require('debug')('jira:job');

let run_lock = false;

let taskVersionInfo = {
    version: '',
    devTime: '',
    testTime: '',
    releasePTime: '',
    customerAccepting: '',
    releaseTime: '',
    isCreate: 0
};

// jobs
async function doJob(targetVersion, options) {
    if (run_lock === true) {
        debug('Job running: try again later.');
        return;
    }

    // 阻塞检测是否取到用户数据
    let timer = null;
    await new Promise((resolve, reject)=> {
        timer = setInterval(()=> {
            if (global.uedFEUsers) {
                timer && clearTimeout(timer);
                resolve(true);
            }
        }, 100);
    });

    let sources = [];
    let newVersionList;

    if (!targetVersion) {
        //1. 查找出昨天0点开始到现在的所有任务版本号
        let startTime = moment(new Date()).add(-2, 'd').format('YYYY-MM-DD');
        let taskSql = sql.taskVersion(startTime);
        let list = await request.xmlRequest(taskSql);
        list.forEach(item=> {
            newVersionList.push(item.fixVersion[0]);
        });
    } else {
        if (typeof targetVersion === 'string') {
            newVersionList = [targetVersion];
        }else if (targetVersion instanceof Array) {
            newVersionList = targetVersion;
        } else {
            debug('targetVersion args error, please checked first.');
            return;
        }

        newVersionList = await validVersions(newVersionList);
    }

    //2. 拉取库中所有现有版本号(没有发布时间，没有bug率报表)
    let versionList = await mongoDB(async db=> {
        return await db.collection('versions').find({ $or: [{ releaseTime: '' }, { isCreate : 0 }] }).toArray();
    });

    //3. 对比筛选出未统计bug率，时间节点不全的版本号
    let isAdd, insertRows = [];
    newVersionList.forEach(newVersion=> {
        isAdd = false;
        versionList.forEach(dbVersion=> {
            if (newVersion === dbVersion.version) {
                isAdd = true;
            }
        });

        if (!isAdd && !arrayExist(insertRows, 'version', newVersion)) {
            insertRows.push(Object.assign({}, taskVersionInfo, {
                version: newVersion,
                addTime: new Date()
            }, (options || {})));
        }
    });

    // 数据库内插入新加入的版本数据
    if (insertRows.length > 0) {
        await mongoDB(async (db, session)=> {
            await db.collection('versions').insertMany(insertRows, { session });
        });
    }

    if (!targetVersion) {
        versionList.forEach(dbVersion=> {
            if (dbVersion.testTime) {
                sources.push(dbVersion.version);
            } else {
                debug('Not converted version: '+ dbVersion.version);
            }
        });
    } else {
        sources = newVersionList;
    }

    if (sources.length === 0) {
        debug('Run Fail: bugs rate need config test time. =>'+ targetVersion);
        sources.length = 0;
        return;
    }

    //4. 重新跑数据
    let actions = [];
    sources.forEach(version=> {
        actions.push(jiraData(version))
    });

    Promise.all(actions).then(results=> {
        //5. 根据重新跑的数据进行重新入库
        reset(sources, results);
        //6. 重置数据库中create状态
        mongoDB(async (db, session)=> {
            db.collection('versions').updateMany({ version: { $in: sources } }, { $set: { isCreate: 1 }}, { session });
        });
        run_lock = false;
        debug('Dojob successful.');
    }).catch(err=> {
        debug(err);
        run_lock = false;
        debug('Dojob Fail.');
    });
}

function validVersions(versions) {
    let result= [];
    let runError = 'Run Error: please checked your jiraVersion.';
    return new Promise((resolve, reject) => {
        if (!versions) {
            resolve(result);
            return;
        }

        let daos = [];

        versions.forEach(version=> {
            if (version) {
                daos.push(request.xmlRequest(sql.checkedVersion(version)));
            }
        });

        if (daos.length > 0) {
            Promise.all(daos).then(results=> {
                results.forEach((versionInfo, index)=> {
                    if (versionInfo.length > 0) {
                        result.push(versions[index]);
                    } else {
                        console.error(runError);
                    }
                });
                resolve(result);
            }).catch(err=> {
                console.error(runError);
                reject([]);
            })
        } else {
            resolve(result);
        }
    });
}

function reset(versions, newVersions) {
    if (!versions) return;

    mongoDB(async (db, session)=> {
        try {
            //清理所有当前版本数据
            await db.collection('bugrate').deleteMany({ version: { $in: versions } }, { session });
            await db.collection('tasks').deleteMany({ version: { $in: versions } }, { session });

            //重新塞入新数据
            if (newVersions) {
                let listRows = [];
                let taskRows = [];
                let updateDaos = [];

                newVersions.forEach(versionInfo=> {
                    versionInfo[0].users.forEach(user=> {
                        user.tasks.forEach(task=> {
                            taskRows.push({
                                name: task.taskName,
                                assignee: user.userName,
                                link: task.link,
                                version: versionInfo[0].fixVersion
                            })
                        });

                        listRows.push({
                            assignee: user.userName,
                            devTime: user.devTime,
                            fixBugsTime: user.fixBugsTime,
                            fixPBugsTime: user.fixPBugsTime,
                            tBugs: user.tbugs,
                            tBugsRate: user.testBugsRate,
                            pBugs: user.pbugs,
                            PBugsRate: user.PBugsRate,
                            overWorkTime: user.overTime,
                            totalWorkTime: ((user.devTime || 0) + (user.fixBugsTime || 0) + (user.fixPBugsTime || 0) + (user.overTime || 0)),
                            reqUpdated: user.reqUpdated,
                            formalBug: user.formalBug,
                            version: versionInfo[0].fixVersion,
                            addTime: new Date()
                        });
                    });

                    updateDaos.push(db.collection('versions').updateOne({version: versionInfo[0].fixVersion}, { $set: { devTime: versionInfo[0].devStartTime }}))
                });

                await Promise.all(updateDaos);
                await db.collection('bugrate').insertMany(listRows);
                await db.collection('tasks').insertMany(taskRows);
            }
        } catch(err) {
            debug(err);
        }
    })
}

function arrayExist(arr, attrName, attrValue) {
    let result = false;
    if (!arr) return result;

    for (let i = 0; i < arr.length; i++) {
        if (arr[i][attrName] === attrValue) {
            result = true;
            break;
        }
    }

    return result;
}

module.exports = doJob;