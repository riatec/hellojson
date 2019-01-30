var http = require('http');
var url  = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

var server = http.createServer(function(req,res){

    // Get url and parse it
    var parsedUrl = url.parse(req.url, true);

    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');
    var qryStringObj = parsedUrl.query;

    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', function(data){
        buffer += decoder.write(data);
    });
    req.on('end', function(){
        buffer += decoder.end();

        var choosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? 
                                router[trimmedPath] : handlers.notFound;

        var data = {
            path: trimmedPath,
            queryObj : qryStringObj,
            method: this.method.toLowerCase(),
            headers: this.headers,
            payload:buffer
        };

        choosenHandler(data, function(statusCode, payload){

            // Route the request to Handler
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200 ;
            payload = typeof(payload) == 'object' ? payload : {};
            var payloadStr = JSON.stringify(payload);
                
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadStr);

        });

    })


});

server.listen(3000, function(){
    console.log("The server is listening in ", 3000);
});

var handlers = {};

handlers.hello = function(data, callback){
    callback(200, {message: "Hello World"});
};

handlers.notFound = function(data, callback){
    callback(404, {message: "page not found"});
};

var router = {
    'hello': handlers.hello
}
