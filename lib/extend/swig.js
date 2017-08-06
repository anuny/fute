const Util    = require('../util');
const File    = Util.file;
const Log     = Util.log;

const Path    = require('path');
const Swig    = require('swig');

const Through = require('through2');

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function(source) {
        for (var prop in source) if (source.hasOwnProperty(prop)) target[prop] = source[prop];
    });
    return target;
}


module.exports = options => {

    var opts = options ? options :{};
	
    if (opts.defaults) {
        Swig.setDefaults(opts.defaults);
    }
	
    if (opts.setup && typeof opts.setup === "function") {
        opts.setup(Swig);
    }
	
    var ext = function (file, enc, callback) {
		
		var isDir = file.isDirectory();
		if(isDir){
			this.push(file);
			return callback();
		}
		
        var data = opts.data || {};
        if (typeof data === "function") {
            data = data(file);
        }
		
        if (file.data) {
            data = extend(file.data, data);
        }
		
        try {
			
			var swiger = opts.varControls ? new Swig.Swig(opts) :Swig;
			var tpl = swiger.compile(String(file.contents), {
				filename:file.path
			});
			var compiled = tpl(data);
			
			file.contents = new Buffer(compiled);
			this.push(file);
			callback(); 
        } catch (err) {
			Log.error(`fute-extend-swig: ${err}`);
            callback();
        }
    }
    return Through.obj(ext)
};