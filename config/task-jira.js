// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

module.exports = {
    auth: {
        'user': 'sheny',
        'pass': '15531685',
    },
    versions: [{
            fixVersion: 'MICEN2_VOC_2017.12',
            releasePTime: '2017-12-25',
            releaseTestTime: '2017-12-18', // 时间如果携带大于0点的小时 则当天日志纳入开发时间， 如果不带小时 则当天日志时间默认不纳入开发时间
            releaseTime: '2017-12-27',
        },
        {
            fixVersion: 'SILK_LV_2017.17',
            releasePTime: '2017-12-27',
            releaseTestTime: '2017-12-21',
            releaseTime: '2017-12-28',
        },
        {
            fixVersion: 'MICEN2_LV_2017.157',
            releasePTime: '2017-12-01',
            releaseTestTime: '2017-11-17',
            releaseTime: '2017-12-13',
        }]
}