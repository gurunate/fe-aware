var restify = require('restify');

var server = restify.createServer({
    name: 'FE Aware services',
    version: '1.0.0'
});

var argv = require('minimist')(process.argv.slice(2));
var port = argv['p'] || 9200;

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.fullResponse());

// GET
server.get('/hars/:id', function (req, res, next) {
    res.send({id: req.params.id});
    return next();
});

// start server
server.listen(port, function () {
    console.log('%s listening at %s', server.name, server.url);
});