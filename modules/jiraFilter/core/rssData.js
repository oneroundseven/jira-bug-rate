// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const request = require('../request');
const util = require('./util');
const logger = require('../../logger');
const sql = require('../../../config/sql-jira');


/**
 * @param {String} [fixVersion]
 * @returns {Promise<any>}
 */
function rssData(versionInfo) {
    if (!versionInfo) {
        logger.error('config get Error: versionInfo is not complete.');
    }

    return new Promise(async (resolve, reject) => {
        try {
            request.xmlRequest(sql.taskData(versionInfo.version)).then(result=> {
                resolve(formatRssData(result, versionInfo));
            }).catch(err=> {
                reject([]);
                logger.error('rssData Error:' + err);
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
        logger.error('rssData items data not exist.');
        return result;
    }

    let tmp, userTmp, version;
    let title,
        link,
        assignee,
        userName,
        fixVersion = versionsInfo.version;

    items.forEach((item, index)=> {
        title = item['title'][0];
        link = item['link'][0];
        assignee = item['assignee'][0]['_'];
        userName = item['assignee'][0]['$']['username'];

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