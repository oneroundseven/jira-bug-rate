// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const path =require('path');
const debug = require('debug')('jira:timeLine');
const util = require('./util');

let defaultTimeLine = {
    devStartTime: null, // 第一次填写日志时间
    devTime: 0,
    fixBugsTime: 0,
    fixPBugsTime: 0,
    overTime: 0
};



function timeLine(logs, versionItem) {
    let result = Object.assign({}, versionItem);
    let now = new Date();
    now = util.transTimeTo24(now.toString());

    if (!result.releaseTestTime) {
        debug('timeLine Warn: releaseTestTime is not specified.'+ versionItem.fixVersion);
        result.releaseTestTime = now;
    }

    if (!result.releasePTime) {
        debug('timeLine Warn: releasePtime is not specified.'+ versionItem.fixVersion);
        result.releasePTime = now;
    }

    if (!result.releaseTime) {
        debug('timeLine Warn: releaseTime is not specified.'+ versionItem.fixVersion);
        result.releaseTime = now;
    }

    try {
        let groupUser = groupByUser(logs);
        for (let userName in groupUser) {
            statisticsTimeLine(groupUser[userName].logs, result, userName);
            debug('timeLine Log: trans '+ userName + ' work log time success');
        }
    } catch (err) {
        throw err;
    }

    return result;
}

/*{
    "logTime": "2017/11/07 11:00 PM",
    "spendTime": "7 hours, 30 minutes",
    "overTime": "0 minutes",
    "userName": "&#x5218;&#x5F64;&#x5F64;",
    "assignee": "sss"

    devStartTime: null, // 第一次填写日志时间
    devTime: null,
    releaseTestTime: null,
    fixBugsTime: null,
    releasePTime: null,
    fixPBugsTime: null,
    releaseTime:null,
    overTime:null // 正式版发布之后日志填写时间 只做统计不纳入计算
}*/
function statisticsTimeLine(userLogs, result, userName) {
    let userLog;
    let users = result.users;
    let timeLine = Object.assign({}, defaultTimeLine);

    let releaseTestTime = util.transTimeTo0(result.releaseTestTime);
    let releasePTime = util.transTimeTo0(result.releasePTime);
    let releaseTime = util.transTimeTo24(result.releaseTime);

    for (let i = 0; i < userLogs.length; i++) {
        userLog = userLogs[i];

        if (i === 0) {
            timeLine.devStartTime = userLog.logTime;
        }

        if (util.date1MoreThanDate2(releaseTestTime, userLog.logTime)) {
            timeLine.devTime += util.transTimeToHourFloat(userLog.spendTime) + util.transTimeToHourFloat(userLog.overTime);
        } else if (releasePTime - releaseTestTime > 0 && util.date1MoreThanDate2(releasePTime, userLog.logTime)) {
            timeLine.fixBugsTime += util.transTimeToHourFloat(userLog.spendTime) + util.transTimeToHourFloat(userLog.overTime);
        } else if (releaseTime - releasePTime > 0 && util.date1MoreThanDate2(releaseTime, userLog.logTime)) {
            timeLine.fixPBugsTime += util.transTimeToHourFloat(userLog.spendTime) + util.transTimeToHourFloat(userLog.overTime);
        } else if (util.date1MoreThanDate2(userLog.logTime, releaseTime)) { // overtime
            timeLine.overTime += util.transTimeToHourFloat(userLog.spendTime) + util.transTimeToHourFloat(userLog.overTime);
        }
    }

    let user = util.arrayObjectSearch(users, 'userName', userName);
    if (user) {
        Object.assign(user, timeLine);
    }
}

function groupByUser(logs) {
    let result = {};

    if (!logs) return result;

    logs.forEach((log, index)=> {
        if (result[log.assignee]) {
            result[log.assignee].logs.push(log);
        } else {
            result[log.assignee] = {
                logs: [log],
                timeline: null
            };
        }
    });

    // sort
    for(let user in result) {
        result[user].logs.sort(sortDate);
    }

    return result;
}

function sortDate(date1Str, date2Str) {
    return new Date(date1Str) > new Date(date2Str);
}

module.exports = timeLine;