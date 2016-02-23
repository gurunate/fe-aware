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

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.fullResponse());

// GET
server.get('/hars/:id', function (req, res, next) {
    findHAR(req.params.id).then(function(har) {
        res.send(har)
        return next();
    });
});


server.get('/entry-report/:id', function (req, res, next) {
    res.send({});
    return next();
});

function findHAR(id) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect('mongodb://' + config.get('db.host') + '/' + config.get('db.database'), function (err, db) {
            if (err) throw err;

            db.collection('hars').findOne({"_id": new ObjectId(id)}, function (err, har) {
                if (err) throw err;
                resolve(har);
                db.close();
            });
        });
    });
}

// start server
server.listen(port, function () {
    winston.log('info', server.name + ' listening at ' + server.url);
});