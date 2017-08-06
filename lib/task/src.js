"use strict";



var through = require("through2");
var gs = require("glob-stream");
var fs = require("graceful-fs");
var File = require("vinyl");

const util      = require('../util')
const stripBom = util.stripBom;
const log      = util.log;



var streamFile = (file, cb) => {
    file.contents = fs.createReadStream(file.path).pipe(stripBom.stream());
    cb(null, file);
};

var bufferFile = (file, cb) => {
	
	
    fs.readFile(file.path, (err, data)=>{
		
		
        if (err) {
            return cb(err);
        }
        file.contents = stripBom(data);
		
        cb(null, file);
    });
};

var readDir = (file, cb) => {
    cb(null, file);
};

var getContents = (opt) => {
    return through.obj((file, enc, cb) => {
        if (file.isDirectory()) {
            return readDir(file, cb);
        }
        if (opt.buffer !== false) {
            return bufferFile(file, cb);
        }
        return streamFile(file, cb);
    });
};

var fetchStats = (file, enc, cb) => {
    fs.lstat(file.path, function(err, stat) {
        if (stat) {
            file.stat = stat;
        }
        cb(err, file);
    });
}

var getStats = () => {
    return through.obj(fetchStats);
};



var createFile = (globFile, enc, cb) => {
    cb(null, new File(globFile));
}

var src = (glob, opt) => {
	
    opt = opt || {};
    var pass = through.obj();
    if (!isValidGlob(glob)) {
        throw new Error("Invalid glob argument: " + glob);
    }
    if (Array.isArray(glob) && glob.length === 0) {
        process.nextTick(pass.end.bind(pass));
        return pass;
    }
    var options = Object.assign(opt, {
        read:true,
        buffer:true
    });
	
	
    var globStream = gs.create(glob, options);
	

    var outputStream = globStream.pipe(through.obj(createFile)).pipe(getStats(options));
    if (options.read !== false) {
        outputStream = outputStream.pipe(getContents(options));
    }
    return outputStream.pipe(pass);
}

var isValidGlob =  (glob) => {
    if (typeof glob === "string") {
        return true;
    }
    if (Array.isArray(glob) && glob.length !== 0) {
        return glob.every(isValidGlob);
    }
    if (Array.isArray(glob) && glob.length === 0) {
        return true;
    }
    return false;
}

module.exports = src;