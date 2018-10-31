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

//schedule.scheduleJob({ second: 10, minute: 0, hour: 23 }, ()=> {

(async ()=> {
    let sources = [];
    //1. 查找出昨天0点开始到现在的所有任务版本号
    let startTime = moment(new Date()).add(-1, 'd').format('YYYY-MM-DD');
    let taskSql = sql.taskVersion.replace('{{overTime}}', startTime);
    let newVersionList = await request.xmlRequest(taskSql);

    //2. 拉取库中所有现有版本号
    let versionList = await new Promise((resolve, reject) => {
        mongoDB(db=> {
            let list = db.collection('versions').find({ $or: [{ releaseTime: '' }, { isCreate : 0 }] });
            list.toArray().then(resolve).catch(reject);
        });
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
                version: newVersion
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
    mongoDB(db=> { db.collection('versions').insertMany(insertRows); });
    //4. 重新跑数据
    let actions = [];
    sources.forEach(version=> {
        actions.push(jiraData(version))
    });

    Promise.all(actions).then(results=> {
        //5. 根据重新跑的数据进行重新入库
        reset(sources, results);
    }).catch(err=> {
        console.log(err);
    })
})();


//});

function reset(versions, newVersions) {
    if (!versions) return;

    mongoDB(async db=> {
        //清理所有当前版本数据
        Promise.all([
            db.collection('lists').deleteMany({ version: { $in: versions } }),
            db.collection('tasks').deleteMany({ version: { $in: versions } })
        ]).catch(err=> {
            console.log(err)
        });

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

            db.collection('lists').insertMany(listRows);
            db.collection('tasks').insertMany(taskRows);
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