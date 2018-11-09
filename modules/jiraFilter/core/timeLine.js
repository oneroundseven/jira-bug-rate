// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

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
    let result = versionItem;

    if (!result.releaseTestTime) {
        debug('timeLine Error: releaseTestTime is not specified.'+ versionItem.fixVersion);
        debug('doJob Fail.');
        process.exit(1);
    }

    if (!result.releasePTime) {
        debug('timeLine Warn: releasePtime is not specified.'+ versionItem.fixVersion);
    }

    if (!result.releaseTime) {
        debug('timeLine Warn: releaseTime is not specified.'+ versionItem.fixVersion);
    }

    try {
        let groupUser = groupByUser(logs);
        getFirstLogTime(logs, result);
        for (let userName in groupUser) {
            statisticsTimeLine(groupUser[userName].logs, result, userName);
            debug('timeLine Log: trans '+ userName + ' work log time success');
        }
    } catch (err) {
        throw err;
    }

    return result;
}

/**
 * 从所有日志中找到时间最早的那个日志时间
 * @param logs
 */
function getFirstLogTime(logs, result) {
    result.devStartTime = null;

    logs.forEach((log, index)=> {
        if (result.devStartTime === null) {
            result.devStartTime = log.logTime;
        }

        if (util.date1MoreThanDate2(result.devStartTime, log.logTime)) {
            result.devStartTime = log.logTime;
        }
    });

    if (result.devStartTime) {
        let tmp = new Date(result.devStartTime);
        result.devStartTime = tmp.getFullYear() + '-' + (tmp.getMonth() + 1) + '-' + tmp.getDate();
    }
}

/*{
    "logTime": "2017/11/07 11:00 PM",
    "spendTime": "7 hours, 30 minutes",
    "overTime": "0 minutes",
    "userName": "&#x5218;&#x5F64;&#x5F64;",
    "assignee": "sss"

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
        /*if (util.date1MoreThanDate2(releaseTestTime, userLog.logTime)) {
            timeLine.devTime += util.transTimeToHourFloat(userLog.spendTime) + util.transTimeToHourFloat(userLog.overTime);
        } else if (releasePTime - releaseTestTime > 0 && util.date1MoreThanDate2(releasePTime, userLog.logTime)) {
            timeLine.fixBugsTime += util.transTimeToHourFloat(userLog.spendTime) + util.transTimeToHourFloat(userLog.overTime);
        } else if (releaseTime - releasePTime > 0 && util.date1MoreThanDate2(releaseTime, userLog.logTime)) {
            timeLine.fixPBugsTime += util.transTimeToHourFloat(userLog.spendTime) + util.transTimeToHourFloat(userLog.overTime);
        } else if (util.date1MoreThanDate2(userLog.logTime, releaseTime)) { // overtime
            timeLine.overTime += util.transTimeToHourFloat(userLog.spendTime) + util.transTimeToHourFloat(userLog.overTime);
        }*/

        // 转测时间之前为开发时间
        if (releaseTestTime && util.date1MoreThanDate2(releaseTestTime, userLog.logTime)) {
            timeLine.devTime += util.transTimeToHourFloat(userLog.spendTime) + util.transTimeToHourFloat(userLog.overTime);
            continue;
        }

        // 发布之后超出时间
        if (releaseTime && util.date1MoreThanDate2(userLog.logTime, releaseTime)) {
            timeLine.overTime += util.transTimeToHourFloat(userLog.spendTime) + util.transTimeToHourFloat(userLog.overTime);
            continue;
        }

        // P版发布之后花费时间
        if (releasePTime && util.date1MoreThanDate2(userLog.logTime, releasePTime)) {
            timeLine.fixPBugsTime += util.transTimeToHourFloat(userLog.spendTime) + util.transTimeToHourFloat(userLog.overTime);
            continue;
        }

        // 转测之后为修复bug时间
        if (releaseTestTime && util.date1MoreThanDate2(userLog.logTime, releaseTestTime)) {
            timeLine.fixBugsTime += util.transTimeToHourFloat(userLog.spendTime) + util.transTimeToHourFloat(userLog.overTime);
            continue;
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