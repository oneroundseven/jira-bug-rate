// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const request = require('../request');
const cheerio = require('cheerio');
const path = require('path');
const debug = require('debug')('jira:cLogs');

let cwd = process.cwd();
const sqlJira = require(path.resolve(cwd, 'config/sql-jira'));
const workLogArgs = '?page=com.focustech.jira.focusjiraimprovement:worklog-tabpanel';


function cLogs (versionItem) {
    return new Promise(async (resolve, reject) => {
        let result = [];
        if (!versionItem) {
            resolve(result);
        }
        try {
            let allTaskAndBugs = await request.xmlRequest(sqlJira.versionData.replace('{{fixVersion}}', versionItem.fixVersion));
            versionItem.allTaskAndBugs = allTaskAndBugs;
            result = await statisticsTime(allTaskAndBugs);
            resolve(result);
        } catch (err) {
            reject(err);
        }
    });
}

function statisticsTime(allTaskAndBugs) {
    let users = sqlJira.users;
    let result = [];
    if (!users || users.length === 0) {
        return result;
    }

    return new Promise((resolve, reject) => {
        try {
            let tmp;
            let len = new Array(allTaskAndBugs.length);
            debug('cLogs Info: allTaskAndBugs =>'+ allTaskAndBugs.length);

            allTaskAndBugs.forEach((taskOrBug, index)=> {
                // 增加延迟机制 避免jira因为请求过多挂掉
                ((item, index)=> {
                    setTimeout(async ()=> {
                        try {
                            debug('cLogs Info: Start get work time, order:'+ index + ', link by:'+  item.link[0])
                            tmp = await request.htmlRequest(item.link[0]+ workLogArgs);
                            result = result.concat(parsePage(tmp));
                        } catch(err) {
                            debug('cLogs Error: Get jira work time error,'+ item.link[0] + ' Cased By:' + err);
                        } finally {
                            len.splice(0,1);
                            if (len.length === 0) {
                                resolve(result);
                            }
                        }
                    }, index * 100);

                })(taskOrBug, index);
            });
        } catch (err) {
            reject(err);
        }
    });
}

function parsePage(body) {
    let users = sqlJira.users;
    let result = [];

    if (!body) return result;
    let $ = cheerio.load(body);
    let logItems = $('.issue-data-block');

    let logTime,
        spendTime,
        overTime,
        userName,
        assignee,
        tmp;

    for (var i = 0; i < logItems.length; i++) {
        if (logItems[i]) {
            logTime = $(logItems[i]).find('.date').html();
            tmp = $(logItems[i]).find('.worklog-duration');
            spendTime = tmp.eq(0).html();
            overTime = tmp.eq(1).html();
            tmp = $(logItems[i]).find('.user-avatar');
            userName = tmp.html();
            assignee = tmp.attr('rel');
            if (users.indexOf(assignee) !== -1) {
                result.push({
                    logTime: logTime,
                    spendTime: spendTime,
                    overTime: overTime,
                    userName: userName,
                    assignee: assignee
                });
            }
        }
    }

    return result;
}

module.exports = cLogs;