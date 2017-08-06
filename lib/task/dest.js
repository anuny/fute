"use strict";

var path = require("path");
var fs = require('fs');
var gfs = require("graceful-fs");
var through = require("through2");
var mkdirp = require("mkdirp");

const util      = require('../util')
const stripBom = util.stripBom;
const log      = util.log;


var streamFile =  (file, cb) =>{
	file.contents = fs.createReadStream(file.path).pipe(stripBom.stream());
	cb(null, file);
};

var writeStream = (writePath, file, cb) =>{
	var opt = {
		mode: file.stat.mode
	};

	var outStream = gfs.createWriteStream(writePath, opt);

	file.contents.once('error', cb);
	outStream.once('error', cb);
	outStream.once('finish', () =>{
		streamFile(file, cb);
	});

	file.contents.pipe(outStream);
};

var writeBuffer = (writePath, file, cb) =>{
	var opt = {
		mode: file.stat.mode
	};
	gfs.writeFile(writePath, file.contents, opt, cb);
};



var writeContents = (writePath, file, cb) => {
	var written = function(err) {
		var done = function(err) {
			cb(err, file);
		};
		if (err) {
			return done(err);
		}
		if (!file.stat || typeof file.stat.mode !== "number") {
			return done();
		}
		fs.stat(writePath, function(err, st) {
			if (err) {
				return done(err);
			}
			// octal 7777 = decimal 4095
			var currentMode = st.mode & 4095;
			if (currentMode === file.stat.mode) {
				return done();
			}
			fs.chmod(writePath, file.stat.mode, done);
		});
	};

	// if directory then mkdirp it
	if (file.isDirectory()) {
		mkdirp(writePath, file.stat.mode, written);
		return;
	}

	// stream it to disk yo
	if (file.isStream()) {
		writeStream(writePath, file, written);
		return;
	}

	// write it like normal
	if (file.isBuffer()) {
		writeBuffer(writePath, file, written);
		return;
	}

	// if no contents then do nothing
	if (file.isNull()) {
		cb(null, file);
		return;
	}
};

function dest(outFolder, opt) {
    opt = opt || {};
    if (typeof outFolder !== "string" && typeof outFolder !== "function") {
        throw new Error("Invalid output folder");
    }
    var options = Object.assign(opt, {
        cwd:process.cwd()
    });
    if (typeof options.mode === "string") {
        options.mode = parseInt(options.mode, 8);
    }
    var cwd = path.resolve(options.cwd);
    function saveFile(file, enc, cb) {
        var basePath;
        if (typeof outFolder === "string") {
            basePath = path.resolve(cwd, outFolder);
        }
        if (typeof outFolder === "function") {
            basePath = path.resolve(cwd, outFolder(file));
        }
        var writePath = path.resolve(basePath, file.relative);
        var writeFolder = path.dirname(writePath);
        // wire up new properties
        file.stat = file.stat ? file.stat :new gfs.Stats();
        file.stat.mode = options.mode || file.stat.mode;
        file.cwd = cwd;
        file.base = basePath;
        file.path = writePath;
		
        // mkdirp the folder the file is going in
        mkdirp(writeFolder, function(err) {
            if (err) {
                return cb(err);
            }
            writeContents(writePath, file, cb);
        });
    }
    var stream = through.obj(saveFile);
    // TODO: option for either backpressure or lossy
    stream.resume();
    return stream;
}

module.exports = dest;