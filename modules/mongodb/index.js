// Copyright 2018 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection Link
const DB_LINK = 'mongodb://192.168.53.78:27017';

// Database Name
const DB_NAME = 'ued-fe-bugs';


module.exports = function(action) {
    return new Promise((resolve, reject) => {
        if (!action) {
            reject('Action must not be null!');
            return;
        }

        let result = null;

        // Use connect method to connect to the server
        MongoClient.connect(DB_LINK,
            {
                useNewUrlParser:true,
                authSource:'admin',
                auto_reconnect: true,
                poolSize: 10
            },
            async function(err, client) {
                assert.equal(null, err);
                try {
                    const session = client.startSession();
                    const db = client.db(DB_NAME);
                    //db.executeDbAdminCommand({ getParameter: 1, featureCompatibilityVersion: 1 });
                    /*session.startTransaction({
                        readConcern: {level: 'snapshot'},
                        writeConcern: {w: 'majority'},
                    });*/

                    if (action) {
                        result = await action(db, session);
                    }
                    //session.commitTransaction();
                    resolve(result);
                } catch (err) {
                    //await session.abortTransaction();
                    reject(err);
                    console.log(err);
                }
                client.close();
            }
        );
    });

};