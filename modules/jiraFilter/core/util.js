// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const util = require('util');
const logger = require('../../logger');

const TIME_REG = {
    day: /(\d+)\s?day[s]?/,
    minute: /(\d+)\s?minute[s]?/,
    hour: /(\d+)\s?hour[s]?/
};

module.exports = {
    arrayObjectSearch: (arr, fieldName, value)=> {
        let result = null;

        if (!arr || !fieldName || !value) {
            logger.error('searchObject Error:'+ fieldName + '=>' + value);
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
    // 数组有则替换 没则增加
    arraySearchReplaceInsert: (arr, fieldName, value, data)=> {
        if (!arr || !fieldName || !value) {
            logger.error('searchObject Error:'+ fieldName + '=>' + value);
            return;
        }

        let isExist = false;

        for (let i = 0; i < arr.length; i++) {
            if (arr[i] && arr[i][fieldName] === value) {
                arr.splice(i, 1, data);
                isExist = true;
                break;
            }
        }

        if (!isExist) {
            arr.push(data);
        }
    },
    transJiraRssData: (jiraRssJson)=> {
        let result = {};

        if (!jiraRssJson) {
            return result;
        }

        if (!jiraRssJson.rss) {
            logger.error('rssData is null.');
            return result;
        }

        if (!jiraRssJson.rss.channel || jiraRssJson.rss.channel.length === 0) {
            logger.error('rssData channel Array is not correct.')
            return result;
        }

        return jiraRssJson.rss.channel[0].item;
    },
    transTimeToHourFloat: function(jiraTime) {
        let result = 0;

        if (!jiraTime) return result;

        let tmp;

        tmp = jiraTime.match(TIME_REG.day);
        if (tmp && tmp.length > 1) {
            // 1d = 8h
            result += parseFloat(tmp[1]) * 8;
        }

        tmp = jiraTime.match(TIME_REG.hour);
        if (tmp && tmp.length > 1) {
            result += parseFloat(tmp[1]);
        }

        tmp = jiraTime.match(TIME_REG.minute);
        if (tmp && tmp.length > 1) {
            if (tmp[1] !== '1') {
                result += parseFloat(tmp[1]) / 60;
            }
        }

        return result;
    },
    date1MoreThanDate2: function(dateStr1, dateStr2) {
        if (!util.isDate(new Date(dateStr1)) || !util.isDate(new Date(dateStr2))) {
            return false;
        }
        return new Date(dateStr1) >= new Date(dateStr2);
    },
    transTimeTo24: function(dateStr) {
        let result = new Date(dateStr);

        if (!dateStr || !util.isDate(result)) {
            return null;
        }

        result.setDate(result.getDate() + 1);
        result.setHours(0);
        result.setMinutes(0);
        result.setSeconds(0);
        result.setMilliseconds(0);

        return result;
    },
    transTimeTo0: function(dateStr) {
        let result = new Date(dateStr);

        if (!util.isDate(result)) {
            return null;
        }

        result.setHours(0);
        result.setMinutes(0);
        result.setSeconds(0);
        result.setMilliseconds(0);

        return result;
    }
}