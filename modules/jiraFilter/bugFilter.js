// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const util = require('./util');
const RESOLUTION_STATUS = {
    '-1': 'Unresolved',
    '1': 'Fixed',
    '2': 'Won\'t Fix',
    '3': 'Duplicate',
    '4': 'Incomplete',
    '5': 'Cannot Reproduce',
    '6': 'Aborted',
    '7': 'Rejected',
    '8': 'Accepted',
    '9': 'Req Updated'
};

const BUG_STATUS = {
    '1': 'Open',
    '3': 'In Progress',
    '4': 'Reopened',
    '5': 'Resolved',
    '6': 'Closed',
    '10025': 'Aborted',
    '10027': 'Tested',
};

const BUG_TYPE = {
    '-1': 'None',
    '10010': '正式版Bug',
    '10009': '正式版Bug-遗留',
    '10911': '验收Bug'
};

const ISSUE_TYPE = {
    '1': 'Bug',
    '3': 'Task',
    '5': 'Sub-task',
    '7': 'Sub-Req'
};

/**
 * {
 *      userName: '',
 *      bugs: 0, // 当前版本内产生的所有bug数
 *      pbugs: 0, // P版产生bug数
 *      tbugs: 0, // 测试版产生bug数
 *      formalBug: 0, // 正式版bug数
 *      reqUpdated: 0 // 第一日志时间到发布正式版时间范围内需求变更数
 * }
 * @type {Array}
 */
let result = [];

function bugFilter(jiraJsonItem, ) {
    if (!jiraJsonItem) return;

    let userName = jiraJsonItem.assignee[0].$.username;
    let resolution = jiraJsonItem.resolution[0].$.id;
    let issueType = jiraJsonItem.type[0].$.id;
    let user = util.arrayObjectSearch(result, 'userName', userName);
    let bugType;

    if (ISSUE_TYPE[issueType] === 'Bug') {
        if (user) {
            bugType = getBugType(jiraJsonItem['customfields']['customfield']);
            if (isNotFormalBug(bugType) && RESOLUTION_STATUS[resolution] === 'Fixed' || RESOLUTION_STATUS[resolution] === 'Unresolved') {
                user.bugs = user.bugs++;
            } else if (RESOLUTION_STATUS[resolution] === 'Req Updated') {
                user.reqUpdated = user.reqUpdated++;
            }
        } else {
            user.push({
                userName: userName,
                bugs: 0,
                pbugs: 0,
                tbugs: 0,
                reqUpdated: 0,
                formalBug: 0
            })
        }
    }
}

/**
 * BUG 类型 customfield_10003
 * BUG 原因分析 customfield_10000
 */
function getBugType(customFields) {
    let result = null;
    if (!customFields)  return result;

    for (let i = 0; i < customFields.length; i++) {
        if (customFields[i].$.id === 'customfield_10003') {
            result = customFields[i]['customfieldvalue'][0].$['key'];
        }
    }

    return null;
}

// 是否为正式版bug
function isNotFormalBug(bugType) {
    let result = true;

    if (!bugType) {
        return result;
    }

    if (bugType === '10010') {
        result = false;
    }
    return result;
}

function getResult() {
    let tmp = result.concat([]);
    result = [];
    return tmp;
}

module.exports = {
    filter: bugFilter,
    getResult: getResult
};