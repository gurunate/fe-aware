'use strict';

const winston = require('winston');
const config = require('config');
const restify = require('restify');
const url = require('url');
const _ = require('lodash');
const moment = require('moment');
const Promise = require("bluebird");
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
require('moment-duration-format');

winston.level = 'debug';
winston.add(winston.transports.File, {filename: config.get('logging.filename')});

let server = restify.createServer({
    name: config.get('server.name'),
    version: '1.0.0'
});

let argv = require('minimist')(process.argv.slice(2));
let port = argv['p'] || config.get('server.port');
let trusted = config.get('sites.trusted');

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.fullResponse());


server.get('/hars', function (req, res, next) {
    findHARs()
        .then(function (data) {
            res.send(data);
            return next();
        })
        .catch(function (err) {
            res.send(500, 'Server error');
            return next();
        });
});

server.get('/hars/:id', function (req, res, next) {
    findHAR(req.params.id)
        .then(function (har) {
            res.send(har);
            return next();
        })
        .catch(function (err) {
            res.send(500, 'Server error');
            return next();
        });
});

server.get('/entry-report/:id', function (req, res, next) {
    findHAR(req.params.id)
        .then(function (har) {
            res.send(analyze(har));
            return next();
        })
        .catch(function (err) {
            res.send(500, 'Server error');
            return next();
        });
});

function findHARs() {
    return new Promise(function (resolve, reject) {
        MongoClient.connect('mongodb://' + config.get('db.host') + '/' + config.get('db.database'), function (err, db) {
            if (err) reject(err);

            db.collection('hars')
                .aggregate([{
                    $unwind: "$log.pages"
                }, {
                    $project: {
                        url: "$log.pages.id",
                        title: "$log.pages.title",
                        duration: "$log.pages.startedDateTime"
                    }
                }])
                .toArray(function (err, docs) {
                    if (err) reject(err);

                    resolve(docs);

                    db.close();
                });
        });
    });
}

function findHAR(id) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect('mongodb://' + config.get('db.host') + '/' + config.get('db.database'), function (err, db) {
            if (err) reject(err);

            db.collection('hars').findOne({"_id": new ObjectId(id)}, function (err, har) {
                if (err) reject(err);

                resolve(har);

                db.close();
            });
        });
    });
}

function analyze(har) {
    let retval = {};
    let data = {};

    retval['url'] = har.log.pages[0].id;
    retval['title'] = har.log.pages[0].title;
    retval['date'] = har.log.pages[0].startedDateTime;

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
            y: obj.time,
            indexLabel: hostname + ' #percent%',
            legendText: hostname,
            duration: moment.duration(obj.time).format("s[s], S[ms]")
        });
    }

    retval['dataPoints'] = _.orderBy(results, ['y'], ['desc']);

    return retval;
}

// start server
server.listen(port, function () {
    winston.log('info', server.name + ' listening at ' + server.url);
});