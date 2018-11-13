// Copyright 2018 FOCUS Inc.All Rights Reserved.

/**
 * 每天晚上11点自动执行
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */


const schedule = require('node-schedule');
const Job = require('./job');

let versions = [
    {
        fixVersion: 'SILK_LV_2018.08',
        releasePTime: '2018-05-15',
        releaseTestTime: '2018-05-07',
        releaseTime: '2018-05-18',
    },
    {
        fixVersion: 'SILK_SV_2018.11',
        releasePTime: '2018-05-15',
        releaseTestTime: '2018-05-11',
        releaseTime: '2018-05-18',
    },
    {
        fixVersion: 'MICEN2_LV_2018.21',
        releasePTime: '2018-03-28',
        releaseTestTime: '2018-03-20',
        releaseTime: '2018-04-03',
    },
    {
        fixVersion: 'MICEN2_VOC_2018.04',
        releasePTime: '2018-04-18',
        releaseTestTime: '2018-04-08',
        releaseTime: '2018-04-19',
    },
    {
        fixVersion: 'SILK_LV_2018.06',
        releasePTime: '2018-04-18',
        releaseTestTime: '2018-04-03',
        releaseTime: '2018-04-24',
    },
    {
        fixVersion: 'SILK_LV_2018.03',
        releasePTime: '2018-03-20',
        releaseTestTime: '2018-03-06',
        releaseTime: '2018-03-22',
    },
    {
        fixVersion: 'MICEN2_VOC_2018.02',
        releasePTime: '2018-03-20',
        releaseTestTime: '2018-03-05',
        releaseTime: '2018-03-22',
    },
    {
        fixVersion: 'MICEN2_LV_2017.179',
        releasePTime: '2018-02-13',
        releaseTestTime: '2018-02-04',
        releaseTime: '2018-02-27',
    },
    {
        fixVersion: 'MICEN2_VOC_2017.12',
        releasePTime: '2017-12-25',
        releaseTestTime: '2017-12-18',
        releaseTime: '2017-12-27',
    },
    {
        fixVersion: 'SILK_LV_2017.17',
        releasePTime: '2017-12-27',
        releaseTestTime: '2017-12-21',
        releaseTime: '2017-12-28',
    },
    {
        fixVersion: 'MICEN2_VOC_2017.11',
        releasePTime: '2017-11-28',
        releaseTestTime: '2017-11-20',
        releaseTime: '2017-12-07'
    },
    {
        fixVersion: 'MICEN2_VOC_2018.01',
        releasePTime: '2018-01-22',
        releaseTestTime: '2018-01-10',
        releaseTime: '2018-01-25'
    },
    {
        fixVersion: 'MICEN2_LV_2017.130',
        releasePTime: '2017-11-10',
        releaseTestTime: '2017-10-20',
        releaseTime: '2017-11-27'
    },
    {
        fixVersion: 'MICEN2_LV_2017.157',
        releasePTime: '2017-12-07',
        releaseTestTime: '2017-11-17',
        releaseTime: '2017-12-13'
    },
    {
        fixVersion: 'MICEN2_LV_2017.154',
        releasePTime: '2018-01-05',
        releaseTestTime: '2017-12-22',
        releaseTime: '2018-01-16'
    },
    {
        fixVersion: 'MICEN2_LV_2017.161',
        releasePTime: '2018-01-15',
        releaseTestTime: '2017-12-07',
        releaseTime: '2018-01-23'
    },
    {
        fixVersion: 'SILK_LV_2017.18',
        releasePTime: '2018-02-02',
        releaseTestTime: '2018-01-17',
        releaseTime: '2018-02-06'
    }
]


// day run
//schedule.scheduleJob({ second: 10, minute: 0, hour: 23 }, Job);

/*
example
Job('MICEN2_LV_2017.179', {
    testTime: '2018-02-04',
    releasePTime: '2018-02-13',
    releaseTime: '2018-02-28'
});
*/

versions.forEach(async versionInfo=> {
    await Job(versionInfo.fixVersion, {
        testTime: versionInfo.releaseTestTime,
        releasePTime: versionInfo.releasePTime,
        releaseTime: versionInfo.releaseTime
    })
})