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
    if (!action) return;

    // Use connect method to connect to the server
    MongoClient.connect(DB_LINK, {useNewUrlParser:true}, function(err, client) {
        assert.equal(null, err);

        const db = client.db(DB_NAME);
        action && action(db);
        client.close();
    });
};