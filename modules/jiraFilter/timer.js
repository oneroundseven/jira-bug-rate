// Copyright 2018 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @desc  每隔五分钟重新获取下版本缓存数据
 * @author oneroundseven@gmail.com
 */

const debug = require('debug')('jira:jiraFilter');
const fs = require('fs');
const path = require('path');

const timerGap = 10 * 60 * 1000;

const localData = path.resolve(process.cwd(), './data/local.json');

let cacheData = null;

function reFreshData() {
    fs.readFile(localData, 'utf8', (err, data)=> {
        if (err) {
            debug('jiraTimer Error:'+ err);
            throw err;
        }

        try {
            cacheData = JSON.parse(data);
        } catch (e) {
            debug('jiraTimer Error: trans data error '+ e);
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
        ctx._jiraTask = cacheData;
        await next();
    }
}

module.exports = jiraTimer;