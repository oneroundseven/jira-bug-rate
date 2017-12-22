// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const request = require('request');
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const debug = require('debug')('jira:tasks');
const sql = require('./sql');