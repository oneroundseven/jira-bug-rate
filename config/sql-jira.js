// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const mongoDB = require('../modules/mongodb');

const PROJECTS = ['MIC任务与缺陷管理项目', 'B2B交易项目', '跨境项目'];
const ISSUEDTYPE = {
    task: ['Task', 'Sub-task', 'Suggestion', 'Sub-Req'],
    bug: ['Bug', 'sub-bug']
};

const COMMA = '%2C'; // ,

// 中文转码
PROJECTS.forEach((item, index)=> {
    PROJECTS[index] = encodeURIComponent(item);
});

function uedFEUsersInit() {
    if (global.uedFEUsers) {
        return global.uedFEUsers;
    }

    mongoDB(async db=> {
        let uedUsers = await db.collection('users').find().toArray();
        let tempUsers = [];
        uedUsers.forEach(user=> {
            tempUsers.push(user.account);
        });
        global.uedFEUsers = tempUsers.join(COMMA);
    });
}

uedFEUsersInit();

module.exports = {
    taskVersion: (overTime)=> {
        return 'http://jira.vemic.com/sr/jira.issueviews:searchrequest-xml/temp/SearchRequest.xml?jqlQuery=project%20in%20('+
        PROJECTS.join(COMMA) +')%20AND%20issuetype%20in%20('+
        ISSUEDTYPE.task.join(COMMA) +')%20AND%20status%20not%20in%20(Aborted)%20AND%20assignee%20in%20('+
        global.uedFEUsers +')%20AND%20createdDate%20%3E%20'+ overTime +'%20ORDER%20BY%20updatedDate';
    },
    taskData: (fixVersions)=> {
        let versions = '';
        if (fixVersions instanceof Array) {
            let temp = [];
            fixVersions.forEach(version=> {
                temp.push('"'+ version + '"');
            });
            versions = temp.join(COMMA);
        } else {
            versions = '"'+ fixVersions + '"';
        }
        return 'http://jira.vemic.com/sr/jira.issueviews:searchrequest-xml/temp/SearchRequest.xml?jqlQuery=project%20in%20('+
        PROJECTS.join(COMMA) +')%20AND%20issuetype%20in%20('+
        ISSUEDTYPE.task.join(COMMA) +')%20AND%20status%20not%20in%20(Aborted)%20AND%20assignee%20in%20('+
        global.uedFEUsers +')%20AND%20fixVersion%20in%20('+ versions +')%20ORDER%20BY%20updatedDate';
    },
    versionData: (fixVersion)=> {
        return 'http://jira.vemic.com/sr/jira.issueviews:searchrequest-xml/temp/SearchRequest.xml?jqlQuery=project%20in%20('+
        PROJECTS.join(COMMA) +')%20AND%20issuetype%20in%20('+
        ISSUEDTYPE.task.concat(ISSUEDTYPE.bug).join(COMMA) +')%20AND%20status%20not%20in%20(Aborted)%20AND%20assignee%20in%20('+
        global.uedFEUsers +')%20AND%20fixVersion%3D"'+ fixVersion +'"';
    },
    checkedVersion: (fixVersion)=> {
        return 'http://jira.vemic.com/sr/jira.issueviews:searchrequest-xml/temp/SearchRequest.xml?' +
        'jqlQuery=fixVersion%3D"'+ fixVersion +'"%20AND%20issuetype%20in%20('+
            ISSUEDTYPE.task.join(COMMA) +')%20AND%20status%20not%20in%20(Aborted)%20AND%20assignee%20in%20('+
            global.uedFEUsers +')&tempMax=1000';
    },
    users: ()=> {
        return global.uedFEUsers;
    }
}