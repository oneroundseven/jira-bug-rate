// Copyright 2018 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @desc  每隔五分钟重新获取下版本缓存数据
 * @author oneroundseven@gmail.com
 */

const debug = require('debug')('jira:jiraFilter');
const cache = require('./cache');

const timerGap = 10 * 60 * 1000;

let localCacheData = null;

function reFreshData() {
    return new Promise(async (resolve, reject) => {
        try {
            localCacheData = await cache.get();
            resolve();
        } catch (e) {
            reject(e);
        }
    });
}

setInterval(()=> {
    reFreshData();
}, timerGap);

/**
 * koa-middle wave
 * @returns {function(*, *)}
 */
function jiraTimer() {
    return async (ctx, next)=> {
        ctx._jiraTask = localCacheData;
        await next();
    }
}

module.exports = jiraTimer;