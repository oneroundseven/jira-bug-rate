// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const debug = require('debug')('jira:jiraFilter');
const util = require('./src/util');
const cLogs = require('./src/cLogs');
const rssData = require('./src/rssData');

let jiraTasks;

/**
 * 更新数据缓存，可以指定单个版本更新或者全部更新
 * @param {String} [fixVersion]
 */
function updateJiraTask(fixVersion) {

    if (fixVersion && !jiraTasks) {
        debug('updateJiraTask Error: global cache do not exist.');
        return;
    }

    if (fixVersion && !util.arrayObjectSearch('fixVerion'), fixVersion) {
        debug('updateJiraTask Error: version cache do not exist.' + fixVersion);
        return;
    } else {
        (async ()=> {
            let rss = await rssData();
            rss.forEach(async (item, index)=> {
                await cLogs(item.fixVersion);
                // 找到对应的版本的 users 进行赋值
            });
        })();
    }

    /*return new Promise(async (resolve, reject) => {
        let result = Object.assign({}, timeline);
        let logs;

        if (!sqlJira || !taskJira) {
            debug('config get Error: config file not exist.');
            resolve(result);
            return;
        }

        try {
            logs = await cLogs(fixVersion);
            resolve(logs);
        } catch(err) {
            debug('crawling Error: get working time log fail.'+ err);
            reject(err);
        }
    });*/
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

updateJiraTask();

module.exports = {
    filter: jiraFilter,
    update: updateJiraTask
};