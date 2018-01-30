// Copyright 2018 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const jiraData = require('./data');
const debug = require('debug')('run:jiraFilter');
const program = require('commander');
const cache = require('./cache');

program
    .version('0.1.0')
    .option('-d --load [version]', 'load version jira data')
    .arguments('<cmd> [version]');

program.on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ custom-help --help');
    console.log('    $ custom-help -h');
    console.log('');
});

program.parse(process.argv);

const DEBUG_DATA = '[{"fixVersion":"MICEN2_VOC_2017.12","releasePTime":"2017-12-25","releaseTestTime":"2017-12-18","releaseTime":"2017-12-27","users":[{"assignee":"陆鑫黎","userName":"luxinli","tasks":[{"taskName":"[MIC-37917] 12月VOC改版 - 前端1","link":"http://jira.vemic.com/browse/MIC-37917"}]},{"assignee":"禹一鸣","userName":"yuyiming","tasks":[{"taskName":"[MIC-37892] 12月VOC改版","link":"http://jira.vemic.com/browse/MIC-37892"},{"taskName":"[MIC-37919] 12月VOC改版 - 前端3","link":"http://jira.vemic.com/browse/MIC-37919"}]},{"assignee":"采小凤","userName":"caixiaofeng","tasks":[{"taskName":"[MIC-37918] 12月VOC改版 - 前端2","link":"http://jira.vemic.com/browse/MIC-37918"},{"taskName":"[MIC-38010] 2017-12 VOC 反馈问题持续改进","link":"http://jira.vemic.com/browse/MIC-38010"}]},{"assignee":"沈阳","userName":"sheny","tasks":[{"taskName":"[MIC-38155] MIC首页搜索框缺少 itemprop=\\"query-input“ 属性","link":"http://jira.vemic.com/browse/MIC-38155"}]}]}]'

if (program.load) {
    debug('start get jira version data: '+ program.load);
    (async ()=> {
        let data = await jiraData(program.load);
        cache.set(data[0]);
    })();
} else {
    debug('version must be input.')
}