// Copyright 2018 FOCUS Inc.All Rights Reserved.

/**
 * 每天晚上11点自动执行
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */


const schedule = require('node-schedule');
const Job = require('./job');


// day run
//schedule.scheduleJob({ second: 10, minute: 0, hour: 23 }, Job);
Job('SILK_LV_2018.03');
