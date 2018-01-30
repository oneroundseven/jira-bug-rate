// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const debug = require('debug')('jira:jiraFilter');
const util = require('./src/util');
const cLogs = require('./src/cLogs');
const rssData = require('./src/rssData');
const timeLine = require('./src/timeLine');
const bugFilter = require('./src/bugFilter');

/**
 * 更新数据缓存，可以指定单个版本更新或者全部更新
 * @param {String} [fixVersion]
 */
function updateJiraTask(fixVersion) {

    if (!fixVersion) {
        debug('updateJiraTask Error: fixVersion must be exist.');
        return;
    }

    // 检测版本是否配置过task-jira

    return new Promise(async (resolve, reject) => {
        try {
            let rss = await rssData(fixVersion);
            let tmpLogs;
            let len = new Array(rss.length);
            rss.forEach(async (versionItem, index)=> {
                try {
                    tmpLogs = await cLogs(versionItem);
                    // 统计所有时间
                    timeLine(tmpLogs, versionItem);
                    // 统计bug数量及bug率
                    bugFilter(versionItem);
                    len.splice(0,1);
                } catch(err) {
                    debug('trans time & bug error:'+ versionItem.fixVersion);
                    len.splice(0,1);
                }

                if (len.length === 0) {
                    resolve(rss);
                    debug('jiraFilter init data Success.');
                }
            });
        } catch(err) {
            debug('jiraFilter init Error:'+ err);
            reject(err);
        }
    });
}

process.on('unhandledRejection', (reason, p) => {
    debug('Unhandled Rejection:', p, 'reason: ', reason);
});




module.exports = updateJiraTask;