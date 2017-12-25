// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const path =require('path');
const debug = require('debug')('jira:timeLine');
const util = require('./util');

let timeline = {
    devStartTime: null, // 第一次填写日志时间
    devTime: null,
    releaseTestTime: null,
    fixBugsTime: null,
    releasePTime: null,
    fixPBugsTime: null,
    releaseTime:null
};

/*{
    "logTime": "2017/11/07 11:00 PM",
    "spendTime": "7 hours, 30 minutes",
    "overTime": "0 minutes",
    "userName": "&#x5218;&#x5F64;&#x5F64;",
    "assignee": "liutongtong"
}*/

function timeLine(cLogs, versionItem) {
    let result = Object.assign({}, timeline, versionItem);


    cLogs.forEach((item, index)=> {

    });
}

function splitLineRange(timeLine, usersLog) {

}

function groupByUser(logs) {
    let result = {};

    if (!logs) return result;

    logs.forEach((log, index)=> {
        if (result[log.assignee]) {
            result[log.assignee].push(log);
        } else {
            result[log.assignee] = [log];
        }
    });

    // sort
    for(let user in result) {
        result[user].sort(sortDate);
    }

    return result;
}

function sortDate(date1Str, date2Str) {
    return new Date(date1Str) > new Date(date2Str);
}

module.exports = timeLine;