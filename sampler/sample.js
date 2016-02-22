#!/usr/local/bin/node

'use strict';

/**
 * @author Nate Johnson
 */

const fs = require('fs');
const spawn = require('child_process').spawn;
const MongoClient = require('mongodb').MongoClient;

let output = '';
let host = process.argv[2];
let webrequest = spawn('phantomjs', ['phantomjs-netsniff.js', host]);

// chunk web request into a variable
webrequest.stdout.on('data', function (chunk) {
    output += chunk.toString();
});

// write HAR file to disk
webrequest.on('close', function () {
    //console.dir(output);

    // Connection URL
    let url = 'mongodb://localhost:27017/fe-aware';

    // Use connect method to connect to the Server
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;

        // Insert HAR document
        db.collection('hars').insertOne(JSON.parse(output), function (err, result) {
            if (err) throw err;

            console.log('Document inserted: %s', result.insertedId);

            db.close();
        });
    });
});
