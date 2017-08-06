const Through  = require('through2');
module.exports = (oldText, newText) => {
	var ext = function(file, enc, cb){
		let contents = String(file.contents);
		let rexp = new RegExp(oldText,"gm");
		let pass = rexp.test(contents);
		if(pass){
			contents= contents.replace(new RegExp(oldText,"gm"),newText);
			file.contents = new Buffer(contents);
		}
		this.push(file);
		cb();
	};
	return Through.obj(ext);
};