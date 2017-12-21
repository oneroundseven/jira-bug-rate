// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const request = require('request');
const xml2js = require('xml2js');
const sql = require('./sql');
const debug = require('debug')('task:Filter');

const AUTH = {
    'auth': {
        'user': 'sheny',
        'pass': '15531685',
        'sendImmediately': true
    }
};

let allTask;

// cache global version & task data & format Data
request(sql.taskData, AUTH, (err, response, body)=> {
    if (!err && response.statusCode === 200) {
        xml2js.parseString(body, (err, result)=> {
            allTask = formatRssData(result.rss);
        });
    } else {
        debug(response.statusCode + ':'+ body);
    }
});

/**
 *  [{
        fixVersion: '',
        releasePTime: '',
        releaseTestTime: '',
        releaseTime: '',
        users: [{
            assignee: '', // 账户名
            userName: '', // 中文名
            tasks: [{
                taskName: '',
                link: ''
            }],
            bugs: '',
            reqUpdated: '',
            devTime: '',
            fixedBugsTime: '',
            testBugsRate: '',
            PBugsRate: ''
        }]
    }]
 */
function formatRssData(rssData) {
    let result = [];

    if (!rssData) {
        debug('rssData is null.');
        return result;
    }
    if (!rssData.channel || rssData.channel.length === 0) {
        debug('rssData channel Array is not correct.')
        return result;
    }

    let items = rssData.channel[0].item;
    if (!items || items.length === 0) {
        debug('rssData items data not exist.');
        return result;
    }

    let tmp, userTmp;
    let title,
        link,
        assignee,
        userName,
        fixVersion;

    items.forEach((item, index)=> {
        title = item['title'][0];
        link = item['link'][0];
        assignee = item['assignee'][0]['_'];
        userName = item['assignee'][0]['$']['username'];
        fixVersion = item['fixVersion'];

        if (!fixVersion || fixVersion.length === 0) {
            fixVersion = 'Other';
        } else {
            fixVersion = fixVersion[0];
        }

        tmp = arrayObjectSearch(result, 'fixVersion', fixVersion);

        if (tmp) {
            userTmp = arrayObjectSearch(tmp.users, 'userName', userName);
            if (userTmp) {
                userTmp.tasks.push({
                    taskName: title,
                    link: link
                });
            } else {
                tmp.users.push({
                    assignee: assignee,
                    userName: userName,
                    tasks: [{
                        taskName: title,
                        link: link
                    }],
                    bugs: '',
                    reqUpdated: '',
                    devTime: '',
                    fixedBugsTime: '',
                    testBugsRate: '',
                    PBugsRate: ''
                });
            }
        } else {
            result.push({
                fixVersion: fixVersion,
                releasePTime: '',
                releaseTestTime: '',
                releaseTime: '',
                users: [{
                    assignee: assignee,
                    userName: userName,
                    tasks: [{
                        taskName: title,
                        link: link
                    }],
                    bugs: '',
                    reqUpdated: '',
                    devTime: '',
                    fixedBugsTime: '',
                    testBugsRate: '',
                    PBugsRate: ''
                }]
            });
        }
    });

    return result;
}

function arrayObjectSearch(arr, fieldName, value) {
    let result = null;

    if (!arr || !fieldName || !value) {
        debug('searchObject Error:'+ fieldName + '=>' + value);
        return result;
    }

    for (let i = 0; i < arr.length; i++) {
        if (arr[i] && arr[i][fieldName] === value) {
            result = arr[i];
            break;
        }
    }

    return result;
}

function getWorkLogTime() {

}

function taskFilter() {
    return async (ctx, next)=> {
        ctx._allTask = allTask;
        await next();
    }
}

module.exports = taskFilter;