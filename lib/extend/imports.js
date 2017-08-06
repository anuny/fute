const util     = require('../util')
const File     = util.file;
const StripBom = util.stripBom;
const Log      = util.log;

const Fs       = require('fs');
const Path     = require('path');

const Through  = require('through2');

// 匹配 import|require
const regInclude = /^(\s+)?(\/\/|\/\*|\#|\<\!\-\-)(\s+)?=(\s+)?(import|require)(.+$)/gm;

// 匹配注释
const regCommand = {
	a:/\s+/g,
	b:/(\/\/|\/\*|\#|<!--)(\s+)?=(\s+)?/g,
	c:/(\*\/|-->)$/g,
	d:/['"]/g
};

module.exports = () => {

	// 记录依赖
    let includedFiles = [];


	let ext = function(file, enc, cb){
		
		// 不存在
		if (file.isNull()) {
			this.push(file);
			return cb();
		}
		
		if (file.isStream()) {
			this.push(file);
			Log.error('fute-extend-include: stream not supported');
			return cb();
		}

		if (file.isBuffer()) {
			// 获取源文件内容
			var compiled = compile(String(file.contents), file.path);
			
			file.contents = new Buffer(compiled.content);
		}
		this.push(file);
		cb();
	};
	
    var compile = (content, filePath) => {
		
		var matches = content.match(regInclude);
        if (!matches) return {content}
		
		var relativeBasePath = Path.dirname(filePath);
        var map = null, insertedLines;
        
        for (var i = 0, len = matches.length; i < len; i++) {
            var leadingWhitespaceMatch = matches[i].match(/^\s*/);
            var leadingWhitespace = null;

            var includeCommand = matches[i].replace(regCommand.a, " ").replace(regCommand.b, "").replace(regCommand.c, "").replace(regCommand.d, "").trim();
            var split = includeCommand.split(" ");
            
            var includeType = split[0];
            var includePath = relativeBasePath + "/" + split[1];
			var fileMatches = [includePath];
			
			if (leadingWhitespaceMatch) leadingWhitespace = leadingWhitespaceMatch[0].replace("\n", "");

			
            if (fileMatches.length < 1) {
				Log.error(`plugin-include: No files found matching "${includePath}"`)
			}
			
            var replaceContent = "";
            for (var y = 0; y < fileMatches.length; y++) {
                var globbedFilePath = fileMatches[y];
                var fileContents = StripBom(Fs.readFileSync(globbedFilePath));
                var compiled = compile(fileContents.toString(), globbedFilePath);
                var resultContent = compiled.content;
                if (includedFiles.indexOf(globbedFilePath) == -1) includedFiles.push(globbedFilePath);
                if (!resultContent.trim().match(/\n$/) && y != fileMatches.length - 1) resultContent += "\n";
                if (leadingWhitespace) resultContent = addLeadingWhitespace(leadingWhitespace, resultContent);
                replaceContent += resultContent;
            }
            if (replaceContent.length) {
                if (leadingWhitespaceMatch[0][0] === "\n")  replaceContent = "\n" + replaceContent;
                content = content.replace(matches[i], function() {
                    return replaceContent;
                });
                insertedLines--;
            }
        }
        return {content}
    }

    var addLeadingWhitespace = (whitespace, string) => {
        return string.split("\n").map(function(line) {
            return whitespace + line;
        }).join("\n");
    }
    return Through.obj(ext);
};