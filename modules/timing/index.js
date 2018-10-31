// Copyright 2018 FOCUS Inc.All Rights Reserved.

/**
 * 每天晚上11点自动执行
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */


const schedule = require('node-schedule');
const sql = require('../../config/sql-jira');
const moment = require('moment');
const mongoDB = require('../mongodb');
const request = require('../jiraFilter/request');
const jiraData = require('../jiraFilter/data');

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

// day run
//schedule.scheduleJob({ second: 10, minute: 0, hour: 23 }, doJob);

// jobs
async function doJob() {
    if (run_lock === true) {
        throw 'Job running: try again later.';
        return;
    }
    let sources = [];
    //1. 查找出昨天0点开始到现在的所有任务版本号
    let startTime = moment(new Date()).add(-2, 'd').format('YYYY-MM-DD');
    let taskSql = sql.taskVersion.replace('{{overTime}}', startTime);
    let newVersionList = await request.xmlRequest(taskSql);

    //2. 拉取库中所有现有版本号(没有发布时间，没有bug率报表)
    let versionList = await mongoDB(async db=> {
        return await db.collection('versions').find({ $or: [{ releaseTime: '' }, { isCreate : 0 }] }).toArray();
    });

    //3. 对比筛选出未统计bug率，时间节点不全的版本号
    let isAdd, newVersion, insertRows = [];
    newVersionList.forEach(versionInfo=> {
        isAdd = false;
        newVersion = versionInfo.fixVersion[0];
        versionList.forEach(dbVersion=> {
            if (newVersion === dbVersion.version) {
                isAdd = true;
            }
        });

        if (!isAdd && !arrayExist(insertRows, 'version', newVersion)) {
            insertRows.push(Object.assign({}, taskVersionInfo, {
                version: newVersion,
                addTime: new Date()
            }));
            sources.push(newVersion);
        }
    });

    versionList.forEach(dbVersion=> {
        if (dbVersion.testTime) {
            sources.push(dbVersion.version);
        }
    });

    //数据库内插入数据
    if (insertRows.length > 0) {
        mongoDB(async (db, session)=> {
            await db.collection('versions').insertMany(insertRows, { session });
        });
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
    }).catch(err=> {
        console.log(err);
    }).finally(()=> {
        run_lock = false;
    })
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
                            totalWorkTime: '',
                            reqUpdated: user.reqUpdated,
                            formalBug: user.formalBug,
                            version: versionInfo[0].fixVersion,
                        });
                    })
                });

                await db.collection('bugrate').insertMany(listRows);
                await db.collection('tasks').insertMany(taskRows);
            }
        } catch(err) {
            console.log(err);
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
