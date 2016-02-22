#!/usr/local/bin/node

'use strict';

const fs = require('fs');
const winston = require('winston');
const config = require('config');
const spawn = require('child_process').spawn;
const MongoClient = require('mongodb').MongoClient;

winston.level = 'debug';
winston.add(winston.transports.File, {filename: config.get('logging.filename')});

let output = '';
let host = process.argv[2];

// sample host
winston.log('info', 'Sampling ' + host);
let webrequest = spawn('phantomjs', ['phantomjs-netsniff.js', host]);

// chunk web request into a variable
webrequest.stdout.on('data', function (chunk) {
    output += chunk.toString();
});

// write HAR file to disk
webrequest.on('close', function () {
    // Connection URL
    let url = 'mongodb://' + config.get('db.host') + '/' + config.get('db.database');

    // Use connect method to connect to the Server
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;

        // Insert HAR document
        db.collection('hars').insertOne(JSON.parse(output), function (err, result) {
            if (err) throw err;

            winston.log('info', 'Document inserted: ' + result.insertedId);

            db.close();
        });
    });
});
