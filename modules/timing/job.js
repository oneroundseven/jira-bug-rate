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
async function doJob(targetVersion, option) {
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
    let newVersionList = [];

    if (!targetVersion) {
        //1. 查找出昨天0点开始到现在的所有任务版本号
        let startTime = moment(new Date()).add(-2, 'd').format('YYYY-MM-DD');
        let taskSql = sql.taskVersion(startTime);
        let list = await request.xmlRequest(taskSql);

        list.forEach(item=> {
            if (newVersionList.indexOf(item.fixVersion[0]) === -1) {
                newVersionList.push(item.fixVersion[0]);
            }
        });
    } else {
        if (typeof targetVersion === 'string') {
            newVersionList = [targetVersion];
        } else {
            debug('targetVersion args error, please checked first.');
            return;
        }
    }

    sources = await versionFilter(newVersionList, option);

    if (sources.length === 0) {
        debug('Run Fail: bugs rate need config test time. =>'+ targetVersion);
        sources.length = 0;
        return;
    }

    //4. 重新跑数据
    let actions = [];
    sources.forEach(versionInfo=> {
        actions.push(jiraData(versionInfo))
    });

    Promise.all(actions).then(results=> {
        //5. 根据重新跑的数据进行重新入库
        reset(sources, results);
        run_lock = false;
        debug('Dojob successful.');
    }).catch(err=> {
        debug(err);
        run_lock = false;
        debug('Dojob Fail.');
    });
}

/**
 * 版本过滤
 * @param newVersionList
 * @param option 给命令行工具 单版本执行使用 传入 转测时间 P版时间 正式版时间等参数
 * 如果版本没有配置转测时间，则尝试从 task 备注中查找是否配置了版本发布转测信息
 * #test:2018-02-03#
 * #prelease:2018-03-12#
 * #release:2018-04-12#
 * @returns {Promise<void>}
 */
function versionFilter(newVersionList, option) {
    let insertRows = [];
    let row = Object.assign({}, taskVersionInfo);

    return new Promise(async (resolve, reject) => {
        try {
            let versionList = await validVersions(newVersionList);
            let config = {};

            if (versionList.length === 0) {
                resolve(insertRows);
                return;
            }

            config[newVersionList] = option || {};
            extend(config, await searchJiraConfigInfo(versionList));

            versionList.forEach(version=> {
                insertRows.push(Object.assign(row, (config[version] || {})));
            });

            resolve(insertRows);
        } catch(err) {
            reject(err);
        }
    });
}

function searchJiraConfigInfo(fixVersions) {
    return new Promise((resolve, reject) => {
        let config = {};
        let version;

        request.xmlRequest(sql.taskData(fixVersions)).then(result=> {
            if (result.length > 0) {
                result.forEach(versionInfo=> {
                    version = versionInfo.fixVersion[0];
                    if (!config[version]) {
                        config[version] = { version };
                    }
                    if (versionInfo.comments && versionInfo.comments.length > 0) {
                        versionInfo.comments.forEach(comment=> {
                            if (comment) {
                                comment.comment.forEach(content=> {
                                    Object.assign(config[version], matchConfig(content._));
                                })
                            }
                        })
                    }
                })
            }
            resolve(config);
        }).catch(err=> {
            reject(err);
            debug('rssData Error:' + err);
        });
    });
}

const TEST_KEY = /#test:(.*?)#/;
const PRELEASE_KEY = /#prelease:(.*?)#/;
const RELEASE_KEY = /#release:(.*?)#/;

function matchConfig(comment) {
    let result = { };
    if (!comment) return result;

    let test = comment.match(TEST_KEY);
    if (test && test.length === 2) {
        result['testTime'] = test[1];
    }

    test = comment.match(PRELEASE_KEY);
    if (test && test.length === 2) {
        result['releasePTime'] = test[1];
    }

    test = comment.match(RELEASE_KEY);
    if (test && test.length === 2) {
        result['releaseTime'] = test[1];
    }

    return result;
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

        // 检查jira中是否真实存在该版本
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

function reset(sources, newVersions) {
    if (!sources) return;

    let hadVersionList = [];
    sources.forEach(item=> {
        hadVersionList.push(item.version);
    });

    mongoDB(async (db, session)=> {
        try {
            if (newVersions) {
                let listRows = [];
                let taskRows = [];
                let versionRows = [];
                let versionConfig;

                newVersions.forEach(versionInfo=> {
                    versionConfig = getJiraCommitConfig(sources, versionInfo[0].fixVersion);
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

                    if (versionConfig.version) {
                        versionRows.push(Object.assign({}, taskVersionInfo, versionConfig, {
                            devTime: versionInfo[0].devStartTime,
                            isCreate: versionConfig.releaseTime ? 0 : 1,
                            addTime: new Date()
                        }));
                    }
                });

                // 清理所有当前版本数据
                await db.collection('bugrate').deleteMany({ version: { $in: hadVersionList } }, { session });
                await db.collection('tasks').deleteMany({ version: { $in: hadVersionList } }, { session });
                await db.collection('versions').deleteMany({ version: { $in: hadVersionList } }, { session });

                // 重新插入新数据
                await db.collection('bugrate').insertMany(listRows);
                await db.collection('tasks').insertMany(taskRows);
                await db.collection('versions').insertMany(versionRows);
            }
        } catch(err) {
            debug(err);
        }
    })
}

function getJiraCommitConfig(versionList, version) {
    let result = {};

    for (let i = 0; i < versionList.length; i++) {
        if (versionList[i] && versionList[i].version === version) {
            result = versionList[i];
            break;
        }
    }

    return result;
}

// deep clone
function extend(source, target) {
    for (let item in target) {
        if (target[item] && source[item] && Object.prototype.toString.call(target[item]) === '[object Object]') {
            extend(source[item], target[item]);
        } else {
            source[item] = target[item];
        }
    }
}


module.exports = doJob;