// 压缩Js

const File    = require('../util').file;
const Uglify  = require('uglify-js');
const Through = require('through2');

const Path    = require('path');

module.exports = () => {

	var ext = function(file, enc, cb){

		let contents = String(file.contents);
		contents= Uglify.minify(contents).code;
		
		file.contents = new Buffer(contents);

		this.push(file);
		cb();
	};
	return Through.obj(ext);
};
