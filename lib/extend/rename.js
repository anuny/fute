const Util      = require('../util');
const Log       = Util.log;
const File      = Util.file;
const Path      = require('path');

const Through  = require('through2');

module.exports = option => {
	var ext = function(file, enc, cb){
		var path = File.remane(file.relative,option);
		if(path){
			file.path = Path.join(file.base, path);
			if (file.sourceMap) {
				file.sourceMap.file = file.relative;
			}
		}else{
			Log.error("Unsupported renaming parameter type supplied")
		}
		this.push(file);
		cb();
	};
	return Through.obj(ext);
};

