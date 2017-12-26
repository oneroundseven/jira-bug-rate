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

let jiraTasks;

/**
 * 更新数据缓存，可以指定单个版本更新或者全部更新
 * @param {String} [fixVersion]
 */
function updateJiraTask(fixVersion) {

    if (!jiraTasks && fixVersion) {
        debug('updateJiraTask Error: global cache do not exist.');
        return;
    }

    if (fixVersion && !util.arrayObjectSearch('fixVerion'), fixVersion) {
        debug('updateJiraTask Error: version cache do not exist.' + fixVersion);
        return;
    }

    return new Promise(async (resolve, reject) => {
        try {
            let rss = await rssData(fixVersion);
            let tmpLogs;
            rss.forEach(async (versionItem, index)=> {
                tmpLogs = await cLogs(versionItem);
                // 统计所有时间
                timeLine(tmpLogs, versionItem);
                // 统计bug数量及bug率
                bugFilter(versionItem);

                if (index === rss.length - 1) {
                    jiraTasks = rss;
                    resolve(rss);
                }
            });
        } catch(err) {
            debug('jiraFilter init Error:'+ err);
            reject(err);
        }
    });
}

/**
 * koa-middle wave
 * @returns {function(*, *)}
 */
function jiraFilter() {
    return async (ctx, next)=> {
        ctx._jiraTask = jiraTasks;
        await next();
    }
}

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection:', p, 'reason: ', reason);
});

updateJiraTask();

module.exports = {
    filter: jiraFilter,
    update: updateJiraTask
};