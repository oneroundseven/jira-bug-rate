// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const debug = require('debug')('jira:bugFilter');
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
 *      reqUpdated: 0, // 第一日志时间到发布正式版时间范围内需求变更数
 *      testBugsRate: '', // tbugs / devTime 7.5h/天
        PBugsRate: '' // pbugs / fixPBugsTime 7.5h/天
 * }
 */
function bugFilter(versionItem) {
    if (!versionItem) return;

    let allTaskAndBugs = versionItem.allTaskAndBugs;
    if (!allTaskAndBugs || allTaskAndBugs.length === 0) {
        debug('bugFilter Warn: not has any bugs and task.'+ versionItem.fixVersion)
    }

    versionItem.bugs = 0;
    let bugsGroup = groupBugByUser(allTaskAndBugs);
    let tmp;
    for (let user in bugsGroup) {
        tmp = statisticsBugs(bugsGroup[user], versionItem, user);
        if (tmp.bugs > 0) {
            versionItem.bugs += tmp.bugs;
        }
    }
}

let defaultBugs = {
    bugs: 0,
    pbugs: 0,
    tbugs: 0,
    reqUpdated: 0,
    formalBug: 0,
    testBugsRate: null,
    PBugsRate: null
};

function statisticsBugs(bugs, versionItem, userName) {
    let result = Object.assign({}, defaultBugs);
    let bugType;
    let resolution;
    let bugCreateTime;

    let releasePTime = versionItem.releasePTime;
    let releaseTime = versionItem.releaseTime;
    let assignee;

    bugs.forEach((bug, index)=> {
        bugType = getBugType(bug['customfields']['customfield']);
        resolution = bug.resolution[0].$.id;
        bugCreateTime = bug.created[0];
        assignee = bug['assignee'][0]['_'];

        if (isNotFormalBug(bugType) && RESOLUTION_STATUS[resolution] === 'Fixed' || RESOLUTION_STATUS[resolution] === 'Unresolved') {
            result.bugs++;

            if (util.date1MoreThanDate2(releasePTime, bugCreateTime)){
                result.tbugs++;
            } else if (util.date1MoreThanDate2(releaseTime, bugCreateTime)) {
                result.pbugs++;
            }
        } else if (RESOLUTION_STATUS[resolution] === 'Req Updated') {
            result.reqUpdated++;
        } else if (!isNotFormalBug(bugType)) {
            result.formalBug++;
        }
    });

    let user = util.arrayObjectSearch(versionItem.users, 'userName', userName);

    // 如果当前版本没有任务,则补充创建user
    if (!user) {
        user = {
            assignee: assignee,
            userName: userName,
            tasks: []
        };
        versionItem.users.push(user);
    }

    if (user && result.bugs > 0 && user.devTime > 0) {
        result.testBugsRate = (result.bugs / (user.devTime / 7.5)).toFixed(2);
    }

    if (user && result.pbugs > 0 && user.fixPBugsTime > 0) {
        result.PBugsRate = (result.pbugs / (user.fixPBugsTime / 7.5)).toFixed(2);
    }

    if (user) {
        Object.assign(user, result);
    }
    return result;
}

/**
 * group bugs buy user
 * @param allTaskAndBugs
 * @returns {{}}
 */
function groupBugByUser(allTaskAndBugs) {
    let result = {};
    let userName;
    let issueType;

    if (!allTaskAndBugs) return result;

    allTaskAndBugs.forEach((item, index)=> {
        userName = item['assignee'][0]['$']['username'];
        issueType = item.type[0].$.id;

        // only bug & req-update can be add
        if (ISSUE_TYPE[issueType] === 'Bug') {
            if (result[userName]) {
                result[userName].push(item);
            } else {
                result[userName] = [item];
            }
        }
    });

    return result;
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

module.exports = bugFilter;