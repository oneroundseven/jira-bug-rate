// Copyright 2018 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const xml2js = require('xml2js');
const debug = require('debug')('jira:request');
const util = require('./core/util');
const request = require('request');

const requestAuth = {
    'auth': {
        'user': 'sheny',
        'pass': '15531685',
        sendImmediately: true
    }
};

module.exports = {
    xmlRequest: (jiraXmlUrl)=> {
        let result = [];
        if (!jiraXmlUrl) return result;

        return new Promise((resolve, reject) => {
            try {
                request(jiraXmlUrl, requestAuth, (err, response, body)=> {
                    if (!err && response.statusCode === 200) {
                        debug('Request success:'+ jiraXmlUrl);
                        xml2js.parseString(body, (err, result)=> {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(util.transJiraRssData(result));
                                debug('cLogs: all task data xml trans to json & filter success!');
                            }
                        });
                    } else {
                        reject(err);
                    }
                });
            } catch (err) {
                debug('cLogs: get all task and bugs error:'+ jiraXmlUrl + err);
                reject(err);
            }

        });
    },
    htmlRequest: (link)=> {
        let result = {};

        if (!link) {
            debug('cLogs Error: Get jira work time error, link is undefined.');
            return result;
        }

        return new Promise((resolve, reject) => {
            request(link, requestAuth, (err, response, body)=> {
                if (!err && response.statusCode === 200) {
                    try {
                        resolve(body);
                    } catch(err) {
                        debug('parsePage Error:'+ link + '=>' + err);
                        reject(err);
                    }

                } else {
                    reject(err, body);
                }
            });
        });
    }
}