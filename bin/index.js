#!/usr/bin/env node
// Copyright 2018 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const program = require('commander');


program
    .version('1.0.0')
    .command('test <commander>')
    .option('-t, --test', 'Test Dir')
    .action(()=> {
        console.log('do something');
    });

program.parse(process.argv);