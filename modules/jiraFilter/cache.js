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
        let cache = await getCacheData();
        let version = data['fixVersion'];
        delete data['allTaskAndBugs'];
        cache[version] = JSON.stringify(data);

        if (data) {
            fs.writeFile(localData, JSON.stringify(cache), 'utf-8', (err)=> {
                if (err) {
                    debug('cache Error: write data error.');
                    throw err;
                }
            });
        }
    })
}


module.exports = {
    get: getCacheData,
    set: reWriteCacheData
};