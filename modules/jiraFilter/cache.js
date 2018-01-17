// Copyright 2018 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const fs = require('fs');
const path = require('path');
const debug = require('debug')('cache:*');

const localData = path.resolve(process.cwd(), './data/local.json');

function getCacheData() {
    return new Promise((resolve, reject) => {
        try {
            fs.readFile(localData, 'utf8', (err, data)=> {
                if (err) {
                    debug('cache Error:'+ err);
                    throw err;
                }

                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    debug('cache Error: trans data error '+ e);
                }
            });
        } catch (err) {
            reject(err);
            debug('cache Error: get cache error.'+ err);
        }
    });

}

function reWriteCacheData() {

}


module.exports = {
    get: getCacheData,
    set: reWriteCacheData
};