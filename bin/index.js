#!/usr/bin/env node
// Copyright 2018 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const program = require('commander');
const doJob = require('../modules/timing/job');

program
    .version('1.0.0')
    .command('run <jiraVersion>')
    .option('-t --test <Date>', '转测时间')
    .option('-p --pre <Date>', 'P版时间')
    .option('-r --release <Date>', '正式版发布时间')
    .option('-d --debug', '是否开启debug模式')
    .option('-e --example', 'bugs run MICEN2_LV_2017.179 -t 2018-02-04 -p 2018-02-13 -r 2018-02-28')
    .description('bug率平台跑数据')
    .action((jiraVersion, cmd)=> {
        if (!jiraVersion) {
            console.error('Args Error: jiraVersion must not be empty.');
            return;
        }

        if (cmd.debug) {
            process.env.DEBUG = 'jira:*';
        }

        try {
            doJob(jiraVersion, {
                testTime: cmd.test,
                releasePTime: cmd.pre,
                releaseTime: cmd.release
            });
        } catch(err) {
            console.error(err);
        }
    });

program.parse(process.argv);