// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const request = require('../request');
const debug = require('debug')('jira:rssData');
const util = require('./util');
const mongoDB = require('../../mongodb');
const sql = require('../../../config/sql-jira');


/**
 * @param {String} [fixVersion]
 * @returns {Promise<any>}
 */
function rssData(fixVersion) {
    if (!fixVersion) {
        debug('config get Error: fixVersion is not config plane time.');
    }

    let versionsInfo;

    return new Promise(async (resolve, reject) => {
        try {
            versionsInfo = await mongoDB(async db=> {
                return await db.collection('versions').find({ version: fixVersion }).toArray();
            });

            if (versionsInfo.length === 0) {
                debug('Get version info error: not complete info in db. =>'+ fixVersion);
                debug('doJob Fail.');
                process.exit(1);
            }

            request.xmlRequest(sql.taskData(fixVersion)).then(result=> {
                resolve(formatRssData(result, versionsInfo[0]));
            }).catch(err=> {
                reject([]);
                debug('rssData Error:' + err);
            });
        } catch (err) {
            reject([]);

        }
    });
}

/**
 *  [{
        fixVersion: '',
        devStartTime: '', 第一次填写日志时间
        releasePTime: '', // mongodb 读取
        releaseTestTime: '', // mongodb 读取
        releaseTime: '', // mongodb 读取
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
            devTime: '', // 第一日填写日志到转测花费时间 记为开发时间
            fixBugsTime: '', // 转测后到P版发布修复BUG花费时间，所有当前版本日志时间总和 不参与任何计算 只是统计
            fixPBugsTime: '', // P版发布后 花费的时间
            testBugsRate: '', // tbugs / devTime 7.5h/天
            PBugsRate: '', // pbugs / fixPBugsTime 7.5h/天
            overTime:null // 正式版发布之后日志填写时间 只做统计不纳入计算
        }]
    }]
 */
function formatRssData(items, versionsInfo) {
    let result = [];

    if (!items || items.length === 0) {
        debug('rssData items data not exist.');
        return result;
    }

    let tmp, userTmp, version;
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

        tmp = util.arrayObjectSearch(result, 'fixVersion', fixVersion);

        if (tmp) {
            userTmp = util.arrayObjectSearch(tmp.users, 'userName', userName);
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
                    }]
                });
            }
        } else {
            version = {
                fixVersion: fixVersion,
                releasePTime: versionsInfo.releasePTime,
                releaseTestTime: versionsInfo.testTime,
                releaseTime: versionsInfo.releaseTime,
                users: [{
                    assignee: assignee,
                    userName: userName,
                    tasks: [{
                        taskName: title,
                        link: link
                    }]
                }]
            };

            result.push(version);
        }
    });

    return result;
}

module.exports = rssData;