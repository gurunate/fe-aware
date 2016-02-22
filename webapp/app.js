'use strict';

const winston = require('winston');
const config = require('config');
const path = require('path');
const hapi = require('hapi');
const inert = require('inert');

winston.level = 'debug';
winston.add(winston.transports.File, {filename: config.get('logging.filename')});

const server = new hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: __dirname
            }
        }
    }
});

server.connection({
    host: 'localhost',
    port: 3000
});

server.register([
    {
        register: require('vision')  // add template rendering support in hapi
    },
    {
        register: require('inert')  // handle static files and directories in hapi
    }
], function (err) {
    if (err) {
        throw err;
    }

    // set view configuration in plugin register callback
    server.views({
        engines: {
            html: require('handlebars')
        },
        path: 'views',
        layoutPath: 'views/layout',
        layout: 'default',
        //helpersPath: 'views/helpers',
        //partialsPath: 'views/partials'
    });
});


var routes = [{
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        var dataPoints = [
            {y: 65899660, indexLabel: "Trusted (#percent%)", legendText: "Trusted"},
            {y: 60929152, indexLabel: "3rd Party (#percent%)", legendText: "3rd Party"},
            {y: 2175850, indexLabel: "Others #percent%", legendText: "Others"}
        ];

        var data = {
            title: 'FE Aware',
            message: 'Hello, World. Your crazy handlebars layout',
            dataPoints: JSON.stringify(dataPoints)
        };

        return reply.view('index', data);
    }
}, {
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public',
            redirectToSlash: true,
            index: true
        }
    }
}];

server.route(routes);

server.start((err) => {
    if (err) {
        throw err;
    }

    winston.log('info', 'Server running at:', server.info.uri);
});