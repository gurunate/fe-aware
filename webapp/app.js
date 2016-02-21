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


var routes = [
    {
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            var data = {
                title: 'FE Aware',
                message: 'Hello, World. Your crazy handlebars layout'
            };

            return reply.view('index', data);
        }
    },
    // static content
    {
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: 'public',
                redirectToSlash: true,
                index: true
            }
        }
    }
];

server.route(routes);

server.start((err) => {
    if (err) {
        throw err;
    }

    winston.log('info', 'Server running at:', server.info.uri);
});