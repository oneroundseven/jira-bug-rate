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

if (program.load) {
    debug('start get jira version data: '+ program.load);
    (async ()=> {
        let data = await jiraData(program.load);
        cache.set(data[0]);
    })();
} else {
    debug('version must be input.')
}