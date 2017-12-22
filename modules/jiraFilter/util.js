// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const debug = require('debug')('jira:util');

module.exports = {
    arrayObjectSearch: (arr, fieldName, value)=> {
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
    },
    transJiraRssData: (jiraRssJson)=> {
        let result = {};

        if (!jiraRssJson) {
            return result;
        }

        if (!jiraRssJson.rss) {
            debug('rssData is null.');
            return result;
        }

        if (!jiraRssJson.rss.channel || jiraRssJson.rss.channel.length === 0) {
            debug('rssData channel Array is not correct.')
            return result;
        }

        return jiraRssJson.rss.channel[0].item;
    },
    compareTime: (date1, date2)=> {
        return new Date(data1) > new Date(date2);
    }
}