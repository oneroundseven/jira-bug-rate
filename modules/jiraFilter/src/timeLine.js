// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const debug = require('debug')('jira:timeLine');
const util = require('./util');

let cwd = process.cwd();
const taskJira = require(path.resolve(cwd, 'config/task-jira'));

let timeline = {
    devStartTime: null, // 第一次填写日志时间
    devTime: null,
    releaseTestTime: null,
    fixBugsTime: null,
    releasePTime: null,
    fixPBugsTime: null,
    releaseTime:null
};

function timeLine(fixVersion, cLogs) {
    let result = Object.assign({}, timeline);

    if (!taskJira.versions || taskJira.versions.length === 0) {
        debug('config get Error: fixVersion is not config plane time.'+ fixVersion);
        resolve(result);
        return;
    }

    if (!util.arrayObjectSearch(taskJira.versions, 'fixVersion', fixVersion)) {
        debug('config get Error: fixVersion is not config plane time.'+ fixVersion);
        resolve(result);
        return;
    }

    cLogs.forEach((item, index)=> {

    });
}

module.exports = timeLine;