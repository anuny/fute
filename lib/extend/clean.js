const Util     = require('../util');
const File     = Util.file;
const Log      = Util.log;
const Through  = require('through2');

module.exports = () => {
	var ext = function(file, enc, cb){
		File.rmdir(file.path,()=>{
			Log.done(`fute-extend-clean: ${file.path} clean finished!`);
		});
		cb();
	};
	return Through.obj(ext);
};