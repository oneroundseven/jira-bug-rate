// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const request = require('request');
const xml2js = require('xml2js');
const sql = require('./sql');
const path = require('path');
const taskProgress = require(path.resolve(process.cwd(), './config/task-progress'));

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
        releasePTime: '', // config 文件导入
        releaseTestTime: '', // config 文件导入
        releaseTime: '', // config 文件导入
        bugs: 0, // 当前版本所有bug总数
        users: [{
            assignee: '',
            userName: '',
            tasks: [{
                taskName: '',
                link: ''
            }],
            bugs: 0, // 当前版本内产生的所有bug数
            pbugs: 0, // P版产生bug数
            tbugs: 0, // 测试版产生bug数
            reqUpdated: 0, // 第一日志时间到发布正式版时间范围内需求变更数
            overTime: '', // 开发时间为大于转测时间，则统计正式版发布之前所有花费时间
            devStartTime: '', 第一次填写日志时间 如果开发开始时间大于测试时间 则后面所有时间全部返回 -1 直接取所有日志时间和所有bug数进行bug率计算
            devTime: '', // 第一日填写日志到转测花费时间 记为开发时间
            fixBugsTime: '', // 转测后到P版发布修复BUG花费时间，所有当前版本日志时间总和 不参与任何计算 只是统计
            fixPBugsTime: '', // P版发布后 花费的时间
            testBugsRate: '', // tbugs / devTime 7.5h/天
            PBugsRate: '' // pbugs / fixPBugsTime 7.5h/天
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

    let tmp, userTmp, progressTmp, version;
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
            version = {
                fixVersion: fixVersion,
                releasePTime: null,
                releaseTestTime: null,
                releaseTime: null,
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
            };

            if (taskProgress) {
                progressTmp = arrayObjectSearch(taskProgress.versions, 'fixVersion', fixVersion);
                if (progressTmp) {
                    version = Object.assign(version, progressTmp);
                }
            }

            result.push(version);
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

function taskFilter() {
    return async (ctx, next)=> {
        ctx._allTask = allTask;
        await next();
    }
}

module.exports = taskFilter;