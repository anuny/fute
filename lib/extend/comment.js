
const Through  = require('through2');

module.exports = (headerText='') => {
	
	var ext = function(file, enc, cb){
		let contents = headerText+String(file.contents);
		file.contents = new Buffer(contents);
		this.push(file);
		cb();
	};
	return Through.obj(ext);
};