var querystring = require("querystring"),
	fs = require("fs"),
	crypto = require("crypto"),
	url = require("url");
var formidable = require("formidable");

// var exec = require("child_process").exec;

function start(res,postData){
	console.log("request handler 'start' was called");

	var body = '<html>'+
	'<head>'+
	'<meta http-equiv="Content-Type" content="text/html;charset=UTF-8"/>'+
	'</head>'+
	'<body>'+
	'<form action="/upload" method="post" enctype="multipart/form-data">'+
	'<input type="file" name="upload"/>'+
	'<input type="submit" value="Upload file"/>'+
	'</form>'+
	'</body>'+
	'</html>';

	res.writeHead(200,{"Content-Type":"text/html"});
	res.write(body);
	res.end();

	// return content;
	// sleep(10000);
	// return "hello Start";
}

function upload(res,req){
	console.log("request handler 'upload' was called");
	var allowFileType = {
		'.png':1,
		'.gif':1,
		'.jpg':0,
		'.jpeg':0
	};
	var form = new formidable.IncomingForm();
	form.uploadDir = "./upload"

	console.log("about to parse");
	var shasum = crypto.createHash("sha1");

	form.parse(req,function(error,fields,files){
		console.log("parsing done");
		if(error){
			res.writeHead(500,{"Content-Type":"text/html"});
			res.write("upload error:<br/>");	
			res.end();
			return;
		}

		//get the upload file sha1 hash
		var s = fs.ReadStream(files.upload.path);
		var fileName = files.upload.name;
		var ext = fileName.substring(fileName.lastIndexOf("."),fileName.length);
		if(allowFileType[ext] == undefined || !allowFileType[ext]){
			res.writeHead(200,{"Content-Type":"text/html"});
			res.write("file type: "+ext+" not allowed!");
			res.end();
		}
		s.on('data',function(d){
			shasum.update(d);
		});
		s.on('end',function(){
			var hash = shasum.digest('hex');
			console.log(hash + ' '+files.upload.path);
			var rename = hash+ext;
			//move the upload file to upload dir
			fs.renameSync(files.upload.path,"upload/"+ rename);
			res.writeHead(200,{"Content-Type":"text/html"});
			res.write("received image:<br/>");
			res.write("<img src='/show/?id="+rename+"'/>");
			res.end();
		});
	});
}

function show(res,req){
	console.log("request handler 'show' was called.");
	var args = querystring.parse(url.parse(req.url).query);
	if( args.id == undefined ){
		res.writeHead(404,{'Content-Type':'text/plain'});
		res.write("file not found");
		res.end();
	}
	fs.readFile("./upload/"+args.id, "binary",function(error, file){
		if(error){
			res.writeHead(500,{'Content-Type':'text/plain'});
			res.write(error + "\n");
			res.end();
		}else{
			res.writeHead(200,{"Content-Type":"image/png"});
			res.write(file,"binary");
			res.end();
		}
	});
}

exports.start = start;
exports.upload = upload;
exports.show = show;