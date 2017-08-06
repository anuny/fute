// 编译less
const File      = require('../util').file;
const Path      = require('path');

const Less      = require('less');
const Through   = require('through2');

module.exports  = compress => {
	var ext = function(file, enc, cb){
		let filename = file.path;
		let options = {compress,filename,paths: []}
		let contents = String(file.contents);
		Less.render(contents, options, (e, content) => {
			file.contents = new Buffer(content.css);
			this.push(file);
			cb();
		}); 
	};
	return Through.obj(ext);
};