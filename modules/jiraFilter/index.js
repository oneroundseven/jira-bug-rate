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

const DEBUG_DATA = '[{"fixVersion":"MICEN2_VOC_2017.12","releasePTime":"2017-12-25","releaseTestTime":"2017-12-18","releaseTime":"2017-12-27","users":[{"assignee":"陆鑫黎","userName":"luxinli","tasks":[{"taskName":"[MIC-37917] 12月VOC改版 - 前端1","link":"http://jira.vemic.com/browse/MIC-37917"}]},{"assignee":"禹一鸣","userName":"yuyiming","tasks":[{"taskName":"[MIC-37892] 12月VOC改版","link":"http://jira.vemic.com/browse/MIC-37892"},{"taskName":"[MIC-37919] 12月VOC改版 - 前端3","link":"http://jira.vemic.com/browse/MIC-37919"}]},{"assignee":"采小凤","userName":"caixiaofeng","tasks":[{"taskName":"[MIC-37918] 12月VOC改版 - 前端2","link":"http://jira.vemic.com/browse/MIC-37918"},{"taskName":"[MIC-38010] 2017-12 VOC 反馈问题持续改进","link":"http://jira.vemic.com/browse/MIC-38010"}]},{"assignee":"沈阳","userName":"sheny","tasks":[{"taskName":"[MIC-38155] MIC首页搜索框缺少 itemprop=\\"query-input“ 属性","link":"http://jira.vemic.com/browse/MIC-38155"}]}]}]'

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
                    jiraTasks = rss;
                    resolve(rss);
                }
            });
        } catch(err) {
            debug('jiraFilter init Error:'+ err);
            reject(err);
            console.log('jira Filter init complete!');
        }
    });
}

/**
 * koa-middle wave
 * @returns {function(*, *)}
 */
function jiraFilter() {
    return async (ctx, next)=> {
        ctx._jiraTask = JSON.parse(DEBUG_DATA);
        await next();
    }
}

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection:', p, 'reason: ', reason);
});

//updateJiraTask();

module.exports = {
    filter: jiraFilter,
    update: updateJiraTask
};