// Copyright 2018 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const fs = require('fs');
const path = require('path');
const debug = require('debug')('cache:*');
const util = require('./src/util');

const localDir = path.resolve(process.cwd(), './data/local.json');

function localCacheData() {
    return new Promise((resolve, reject) => {
        try {
            fs.readFile(localDir, 'utf8', (err, data)=> {
                if (err) {
                    debug('cache Error:'+ err);
                    throw err;
                }

                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                    debug('cache Error: trans data error '+ e);
                }
            });
        } catch (err) {
            reject(err);
            debug('cache Error: get cache error.'+ err);
        }
    });

}

function reWriteCacheData(data) {
    return new Promise(async (resolve, reject) => {
        try {
            let cache = await localCacheData();
            delete data['allTaskAndBugs'];
            util.arraySearchReplaceInsert(cache, 'fixVersion', data['fixVersion'], data);

            if (data) {
                fs.writeFile(localDir, JSON.stringify(cache), 'utf-8', (err)=> {
                    if (err) {
                        debug('cache Error: write data error.');
                        reject(err);
                        throw err;
                    }

                    resolve();
                });
            }
        } catch (e) {
            reject(e);
        }
    })
}


module.exports = {
    get: localCacheData,
    set: reWriteCacheData
};