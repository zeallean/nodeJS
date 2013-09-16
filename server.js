var http = require('http');
var url = require("url");

function start(route,handle){
	http.createServer(function(req,res){
		var pathname = url.parse(req.url).pathname.replace(/(\w+)\/*/,"$1");
		console.log("Request for"+req.url+"; path:"+pathname + " received.");

		route(handle, pathname, res, req);

	}).listen(8888);
	console.log("sersver has started");
}

exports.start = start;



