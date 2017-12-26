// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const request = require('request');
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const path = require('path');
const debug = require('debug')('jira:cLogs');
const util = require('./util');

let cwd = process.cwd();
const sqlJira = require(path.resolve(cwd, 'config/sql-jira'));
const taskJira = require(path.resolve(cwd, 'config/task-jira'));
const workLogArgs = '?page=com.focustech.jira.focusjiraimprovement:worklog-tabpanel';

let requestAuth = {
    'auth': Object.assign({}, taskJira.auth, { sendImmediately: true })
};

function cLogs (versionItem) {
    return new Promise(async (resolve, reject) => {
        let result;

        try {
            let allTaskAndBugs = await getAllTaskAndBugs(versionItem.fixVersion);
            versionItem.allTaskAndBugs = allTaskAndBugs;
            result = await statisticsTime(allTaskAndBugs);
            resolve(result);
        } catch (err) {
            reject(err);
        }
    });
}

function getAllTaskAndBugs(fixVersion) {
    let result = [];
    if (!fixVersion) return result;

    return new Promise((resolve, reject) => {
        let query = sqlJira.versionData.replace('{{fixVersion}}', fixVersion);
        try {
            request(query, requestAuth, (err, response, body)=> {
                if (!err && response.statusCode === 200) {
                    xml2js.parseString(body, (err, result)=> {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(util.transJiraRssData(result));
                        }
                    });
                } else {
                    reject(err);
                }
            });
        } catch (err) {
            debug('get all task and bugs error:'+ fixVersion + err);
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
            allTaskAndBugs.forEach(async (item, index)=> {
                tmp = await tranLogTime(item.link[0]);
                result = result.concat(tmp);
                len.splice(0,1);
                if (len.length === 0) {
                    resolve(result);
                }
            });
        } catch (err) {
            reject(err);
        }
    });
}

function tranLogTime(link) {
    let result = {};

    if (!link) {
        return result;
    }

    return new Promise((resolve, reject) => {
        request(link + workLogArgs, requestAuth, (err, response, body)=> {
            if (!err && response.statusCode === 200) {
                try {
                    resolve(parsePage(body));
                } catch(err) {
                    debug('parsePage Error:'+ link + '=>' + err);
                    reject(err);
                }

            } else {
                reject(err);
            }
        });
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