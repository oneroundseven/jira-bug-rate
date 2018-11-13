// Copyright 2018 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview summers-ice
 * @author oneroundseven@gmail.com
 */
process.env.DEBUG = 'BUGS:* ';

const debug = require('debug');
const log4js = require('log4js');
let logger;

const warn = debug('BUGS:Warning');
warn.color = 3;
const info = debug('BUGS:Info');
info.color = 0;
const error = debug('BUGS:Error');
error.color = 41;
const compile = debug('BUGS:Compile');
compile.color = 6;

// log4js config
if (process.env.LOG4JS) {
    log4js.configure({
        appenders: { runner: { type: 'file', filename: 'runner.log' } },
        categories: { default: { appenders: ['runner'], level: 'all' } }
    });
    logger = log4js.getLogger("runner");
}

module.exports = {
    warn: (content)=> { logger ? logger.warn(content) : warn(content);},
    info: (content)=> { logger ? logger.info(content) : info(content); },
    error: (content)=> { logger ? logger.error(content) : error(content); },
    compile: (content)=> { logger ? logger.debug(content) : compile(content); }
};