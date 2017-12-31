const Util    = require('../util')
const Log     = Util.log;
const File    = Util.file;
const Mine    = Util.mine;

const Fs      = require('fs');
const Path    = require('path');
const Http    = require('http');
const Wss     = require('ws').Server;
const Url     = require('url');
const Cp      = require('child_process');
const Through = require('through2');


var checkPort = (port,callback)=>{
	var server = Http.createServer().listen(port);
	server.on("listening", ()=>{
		server.close();
		callback(true);
	});
	server.on("error",err => {
		if (err.code === "EADDRINUSE") {
			callback(false);
		}
	});
}

var randomPort = (port,callback) => {	
	port = parseInt(port);
	checkPort(port,stat=>{
		if(stat){
			callback(port);
		}else{
			randomPort(port+1,callback)
		}
	})
}

module.exports = service = options => {
	return new service.core.init(options)
}

service.core = service.prototype = {
	constructor: service,
	init: function(options) {
		this.root = '';
		this.port = options.port||3000;
		this.sport=3001; // socket端口
		this.isopen = options.open;
		this.isreload = options.reload;
		this.socket = null; // socket服务
		this.mgs = null; // 客户端消息
		this.ws = null; // 建立连接后实体
		return this;
	},
	// 开启服务
	start:function(){
		
		if(this.isreload){
			// 创建socket服务
			randomPort(this.sport,port => {
				this.sport = port;
				this.socket = new Wss({port: this.sport});
				
				// 监听连接与消息
				this.socket.on('connection',  ws => {
					this.ws = ws;
					ws.on('message', message => {
						this.mgs = message;
					});
					ws.on("error", (code)=>{
						ws.close();
					});
				});
			})
		}
		
		
		// 创建http服务
		var creatServer = (root, enc, callback) =>{
			this.root = root.path;

			// 检查端口，端口被占使用随机端口
			randomPort(this.port, port=> {
				if(this.port != port){
					this.port = port;
					Log.error(`fute-extend-server : The port "${this.port}" is occupied! The new port is ${port}`);
				}
				let servered = this.creatServer().listen(this.port);
				let url = `http://localhost:${this.port}`;
				Log.done(`server start ${url}`);
				if(this.isopen) Cp.exec(`start ${url}`);
				callback();
				this.server = servered;
				return servered;	
			})
		}
		
		return Through.obj(creatServer);
	},
	// 刷新页面
	reload:function(type){
		var reloader = (root, enc, callback)=>{
			callback();
		};

		if(this.isreload){
			reloader=(root, enc, callback)=>{	
				// html与js 刷新页面，css则替换css文件
				type = type==='css'?'css':'reload';			
				// 判断socket是否创建和客户端是否建立连接
				if(this.ws && this.mgs === 'open'){
					this.ws.send(type)
				}
				callback();
			}
		}
		
		return Through.obj(reloader);
	},

	creatServer:function(){
		
		// 默认文档类型
		let plainType = {'Content-Type': 'text/plain'};
		
		let createServer = (request, response) =>{
			
			// 访问文件路径
			var pathname = Url.parse(request.url).pathname;
			
			
			// 默认文档
			if (pathname.charAt(pathname.length - 1) == "/") pathname += "index.html";
			
			// 根路径
			var wwwroot = Path.join(this.root, pathname);
			
			// 扩展名
			var ext = Path.extname(wwwroot);
			ext = ext ? ext.slice(1) : 'unknown';
			
			if(File.exists(wwwroot)){
				Fs.readFile(wwwroot, "binary", (error, doc) => {
					
					if (error) {
						response.writeHead(500, plainType);
						response.end(error);
					} else {
						
						// 在html文件</body>前添加socket支持脚本；
						var isHtml = ext === 'html' || ext === 'htm';
						if(this.isreload && isHtml) doc = this.replaceContent(doc);
						
						var contentType = Mine[ext] || "text/plain";
						response.writeHead(200, contentType);
						response.write(doc, "binary");
						response.end();
					}
				});
			}else{
				response.writeHead(404, plainType);
				response.write(`This request URL ${pathname} was not found on this server.`);
				response.end();
			} 
		}
		return Http.createServer(createServer);
		
	},
	replaceContent:function(file){
		var oldBody,matchBody,newBody = `<script>!function(){if(!window.WebSocket)return;var a=new WebSocket("ws://localhost:${this.sport}"),b=document.getElementsByTagName("link"),c=function(a){var b="nocache="+Date.now();return a+=a.indexOf("?")>-1?-1==a.indexOf("nocache=")?"&"+b:"":"?"+b},d={reload:function(){setTimeout(function(){location.reload()},300)},css:function(){setTimeout(function(){var a,d,e,f,g;for(a=0,d=b.length;d>a;a++)e=b[a],f=e.getAttribute("href"),g=c(f),e.setAttribute("href",g)},300)}};a.onmessage=function(a){var b=d[a.data];"function"==typeof b&&b()},a.onopen=function(){a.send("open")}}();</script>\r\n`;
		matchBody = file.match(/<\/body[^>]*>/i);
		if(matchBody) oldBody = matchBody[0]
		if(oldBody)file = file.replace(oldBody, newBody + oldBody);
		return file;
	}
};
service.core.init.prototype = service.core;
