// Copyright 2018 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const mongoDB = require('../mongodb');

function getLocalData() {
    return mongoDB(async db=> {
        try {
            let localData = [];
            let temp;

            let s = new Date().getTime();
            let versionsList = await db.collection('versions').find().sort({ addTime: -1 }).toArray();
            let usersList = await db.collection('users').find().toArray();
            let bugRateList = await db.collection('bugrate').find().toArray();
            let tasksList = await db.collection('tasks').find().toArray();
            let usersMapping = {};

            usersList.forEach(user=> {
                usersMapping[user.account] = user.name;
            });

            let version, userInfo;
            versionsList.forEach(versionInfo=> {
                version = versionInfo.version;
                temp = Object.assign({}, versionInfo);
                temp.users = [];
                bugRateList.forEach(bugInfo=> {
                    if (bugInfo.version === version) {
                        userInfo = Object.assign({}, bugInfo);
                        userInfo.name = usersMapping[userInfo.assignee] || 'unknow';
                        userInfo.tasks = [];
                        tasksList.forEach(taskInfo=> {
                            if (userInfo.version === version && userInfo.assignee === taskInfo.assignee) {
                                userInfo.tasks.push(taskInfo)
                            }
                        });
                        temp.users.push(userInfo);
                    }
                });
                localData.push(temp);
            });

            return localData;
        } catch (err) {
            console.log(err);
        }
    });
}

/**
 * koa-middle wave
 * @returns {function(*, *)}
 */
function jiraTimer() {
    return async (ctx, next)=> {
        ctx._jiraTask = await getLocalData();
        await next();
    }
}

module.exports = jiraTimer;