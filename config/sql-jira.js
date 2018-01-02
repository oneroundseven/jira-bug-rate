// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

let overTime = '2017-10-01';
let projects = ['MIC任务与缺陷管理项目', 'B2B交易项目', '跨境项目'];
let uedFEUsers = ['sheny', 'caixiaofeng', 'caojiarui', 'chenghao', 'fangxingxing', 'jiangcheng-a',
    'jianghuan', 'liuqiuyue', 'liutongtong', 'luxinli', 'lvkaifeng', 'lvxiang', 'qinfan',
    'sunzhaowei', 'tanglu', 'yuyiming'];
let issuetype = {
    task: ['Task', 'Sub-task', 'Suggestion', 'Sub-Req'],
    bug: ['Bug', 'sub-bug']
};

let comma = '%2C'; // ,

// 中文转码
projects.forEach((item, index)=> {
    projects[index] = encodeURIComponent(item);
});

module.exports = {
    taskData: 'http://jira.vemic.com/sr/jira.issueviews:searchrequest-xml/temp/SearchRequest.xml?jqlQuery=project%20in%20('+
    projects.join(comma) +')%20AND%20issuetype%20in%20('+
    issuetype.task.join(comma) +')%20AND%20status%20not%20in%20(Aborted)%20AND%20assignee%20in%20('+
    uedFEUsers.join(comma) +')%20AND%20fixVersion%3D"SILK_LV_2017.17"%20AND%20createdDate%20%3E%20'+ overTime +'%20ORDER%20BY%20updatedDate',
    //uedFEUsers.join(comma) +')%20AND%20createdDate%20%3E%20'+ overTime +'%20ORDER%20BY%20updatedDate',
    versionData: 'http://jira.vemic.com/sr/jira.issueviews:searchrequest-xml/temp/SearchRequest.xml?jqlQuery=project%20in%20('+
    projects.join(comma) +')%20AND%20issuetype%20in%20('+
    issuetype.task.concat(issuetype.bug).join(comma) +')%20AND%20status%20not%20in%20(Aborted)%20AND%20assignee%20in%20('+
    uedFEUsers.join(comma) +')%20AND%20createdDate%20%3E%20'+ overTime +'%20AND%20fixVersion%3D"{{fixVersion}}"',
    users: uedFEUsers
}