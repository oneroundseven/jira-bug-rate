// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const request = require('request');
const cheerio = require('cheerio');

const AUTH = {
    'auth': {
        'user': 'sheny',
        'pass': '15531685',
        'sendImmediately': true
    }
};



request('http://jira.vemic.com/browse/MIC-38011?page=com.focustech.jira.focusjiraimprovement:worklog-tabpanel', AUTH, (err, response, body)=> {
    if (!err && response.statusCode === 200) {
        let $ = cheerio.load(body);
        let logItems = $('.issue-data-block');

        let logTime,
            spendTime,
            userName,
            assignee;

        let result = [];

        for (var i = 0; i < logItems.length; i++) {
            if (logItems[i]) {
                logTime = $(logItems[i]).find('.date').html();
                spendTime = $(logItems[i]).find('.worklog-duration');
                userName = $(logItems[i]).find('.user-avatar').html();
                assignee = $(logItems[i]).find('.user-avatar').attr('rel');
                result.push({
                    logTime: logTime,
                    spendTime: spendTime,
                    userName: userName,
                    assignee: assignee
                });
            }
        }
        console.log(result);
    }
});

function tranLogTime(logWrap) {
    let result = 0;
    if (!logWrap) return result;


}