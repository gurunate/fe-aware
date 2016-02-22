#!/usr/local/bin/node

'use strict';

const fs = require('fs');
const config = require('config');
const url = require('url');
const _ = require('lodash');
const moment = require('moment');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
require('moment-duration-format');

// load config
let trusted = config.get('trusted');

let doc_id = process.argv[2] || '56bf67d61b63c9c700cdcc62';

// Use connect method to connect to the Server
MongoClient.connect('mongodb://localhost:27017/fe-aware', function (err, db) {
    if (err) throw err;

    db.collection('hars').findOne({"_id": new ObjectId(doc_id)}, function (err, har) {
        let data = {};

        // index results
        har.log.entries.forEach(function (entry) {
            let hostname = url.parse(entry.request.url).hostname;
            let item = data[hostname];
            let cnt = (item && item.hasOwnProperty('count')) ? parseInt(item.count) : 0;
            let time = (item && item.hasOwnProperty('time')) ? parseFloat(item.time) : 0;

            data[hostname] = {
                count: cnt + 1,
                time: time + entry.time
            };
        });

        // assemble results
        let results = [];
        for (let hostname in data) {
            let obj = data[hostname];

            results.push({
                hostname: hostname,
                calls: obj.count,
                time: obj.time,
                trusted: (trusted[hostname]) ? true : false
            });
        }

        console.log('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
        console.log('URL: %s', har.log.pages[0].id);
        console.log('ID: %s', har._id);
        console.log('Entries: %s', har.log.entries.length);
        console.log('Sampled on: %s', moment(har.log.pages[0].startedDateTime).format('MMMM Do YYYY, h:mm a'));
        console.log('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');

        // show report
        let no = 0;

        const flagThirdParty = _.once(function () {
            no = 0;
            console.log('=-=-= 3rd Party Scripts =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
        });

        _.orderBy(results, ['trusted', 'calls', 'time'], ['desc', 'desc', 'desc']).forEach(function (record) {
            if (!record.trusted) {
                flagThirdParty();
            }

            console.log('%d. %s | %s calls | %s', ++no, record.hostname, record.calls, moment.duration(record.time).format("s[s], S[ms]"));
        });

        db.close();
    });
});