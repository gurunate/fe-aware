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
        //var dataPoints = [
        //    {y: 65899660, indexLabel: "Trusted (#percent%)", legendText: "Trusted"},
        //    {y: 60929152, indexLabel: "3rd Party (#percent%)", legendText: "3rd Party"},
        //    {y: 2175850, indexLabel: "Others #percent%", legendText: "Others"}
        //];

        var dataPoints = [{"y":3398,"indexLabel":"www.cstatic-graphics.com #percent%","legendText":"www.cstatic-graphics.com"},{"y":2801,"indexLabel":"www.cstatic-images.com #percent%","legendText":"www.cstatic-images.com"},{"y":2227,"indexLabel":"www.collserve.com #percent%","legendText":"www.collserve.com"},{"y":1424,"indexLabel":"www.cars.com #percent%","legendText":"www.cars.com"},{"y":1291,"indexLabel":"securepubads.g.doubleclick.net #percent%","legendText":"securepubads.g.doubleclick.net"},{"y":1078,"indexLabel":"s.thebrighttag.com #percent%","legendText":"s.thebrighttag.com"},{"y":1016,"indexLabel":"fonts.gstatic.com #percent%","legendText":"fonts.gstatic.com"},{"y":814,"indexLabel":"tpc.googlesyndication.com #percent%","legendText":"tpc.googlesyndication.com"},{"y":220,"indexLabel":"vcu.collserve.com #percent%","legendText":"vcu.collserve.com"},{"y":210,"indexLabel":"carscomconsumer.collect.igodigital.com #percent%","legendText":"carscomconsumer.collect.igodigital.com"},{"y":182,"indexLabel":"www.googletagservices.com #percent%","legendText":"www.googletagservices.com"},{"y":177,"indexLabel":"us-sonar.sociomantic.com #percent%","legendText":"us-sonar.sociomantic.com"},{"y":107,"indexLabel":"fonts.googleapis.com #percent%","legendText":"fonts.googleapis.com"},{"y":97,"indexLabel":"ssl.google-analytics.com #percent%","legendText":"ssl.google-analytics.com"},{"y":86,"indexLabel":"sb.scorecardresearch.com #percent%","legendText":"sb.scorecardresearch.com"},{"y":80,"indexLabel":"pagead2.googlesyndication.com #percent%","legendText":"pagead2.googlesyndication.com"},{"y":75,"indexLabel":"s.btstatic.com #percent%","legendText":"s.btstatic.com"},{"y":74,"indexLabel":"z.moatads.com #percent%","legendText":"z.moatads.com"},{"y":66,"indexLabel":"assets.adobedtm.com #percent%","legendText":"assets.adobedtm.com"},{"y":65,"indexLabel":"www.google-analytics.com #percent%","legendText":"www.google-analytics.com"},{"y":54,"indexLabel":"s0.2mdn.net #percent%","legendText":"s0.2mdn.net"},{"y":47,"indexLabel":"bat.bing.com #percent%","legendText":"bat.bing.com"},{"y":32,"indexLabel":"partner.googleadservices.com #percent%","legendText":"partner.googleadservices.com"}];

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