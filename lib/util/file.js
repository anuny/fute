const fs       = require('fs');
const path     = require('path');
const log      = require('./logs');

// 判断文件夹
var exists = (dirpath) => {
	return fs.existsSync(dirpath)
}

// 创建文件夹
var mkdir = (dirpath,dirname) => {
	//判断是否是第一次调用  
	if(typeof dirname === "undefined"){   
		if(exists(dirpath)){  
			return;  
		}else{  
			mkdir(dirpath,path.dirname(dirpath));  
		}  
	}else{  
		//判断第二个参数是否正常，避免调用时传入错误参数  
		if(dirname !== path.dirname(dirpath)){   
			mkdir(dirpath);  
			return;  
		}  
		if(exists(dirname)){  
			fs.mkdirSync(dirpath)  
		}else{  
			mkdir(dirname,path.dirname(dirname));  
			fs.mkdirSync(dirpath);  
		}  
	}  
}
var getFiles = dirpath => {
	let files = [];
	if( exists(dirpath) )  files = fs.readdirSync(dirpath);
	return files;
}

// 删除文件夹
var rmdir = (dirpath, callback) => {
	let files = [];
    if( exists(dirpath) ) {
        files = fs.readdirSync(dirpath);
        files.forEach(function(file,index){
            var curPath = path.join(dirpath,file);
            if(fs.statSync(curPath).isDirectory()) { // recurse
                rmdir(curPath,()=>{
					'function' === typeof callback && callback('done',`Folder ${curPath} has been deleted!`);
				});
            } else { // delete file
                fs.unlinkSync(curPath);
				'function' === typeof callback && callback('done',`File ${curPath} has been deleted!`);
            }
        });
        fs.rmdirSync(dirpath);
    }
}

var copy = ( src, dst ,callback) => {
	let readable, writable,srcPath,dstPath,files = [];
	if( exists(src) ) {
		files = fs.readdirSync(src);
	}
	files.forEach(function(file,index){
		srcPath = path.join(src,file);
		dstPath = path.join(dst,file);
		if(fs.statSync(srcPath).isDirectory()) {
			console.log(file)
			mkdir(dst,srcPath);
		} else {
			readable = fs.createReadStream( srcPath );
			writable = fs.createWriteStream( dstPath );   
			readable.pipe( writable );
			let fileName = path.parse(srcPath).base
			readable.on('open', function(){
				'function' === typeof callback && callback('info',fileName);
			});
			
			writable.on('finish', function(){
				'function' === typeof callback && callback('done',fileName);
			});
		}
	});
		
};

var parse = (filepath) => {
	var extname = path.extname(filepath);
	return {
		dirname:path.dirname(filepath),
		basename:path.basename(filepath, extname),
		extname:extname
	};
}

var remane = (filepath,option) => {
	var parsedPath = parse(filepath);
	var newPath;
	var type = typeof option;
	if (type === "string" && option !== "") {
		newPath = option;
	} else if (type === "function") {
		option(parsedPath);
		newPath = path.join(parsedPath.dirname, parsedPath.basename + parsedPath.extname);
	} else if (type === "object" && option !== undefined && option !== null) {
		var dirname = "dirname" in option ? option.dirname :parsedPath.dirname, prefix = option.prefix || "", suffix = option.suffix || "", basename = "basename" in option ? option.basename :parsedPath.basename, extname = "extname" in option ? option.extname :parsedPath.extname;
		newPath = path.join(dirname, prefix + basename + suffix + extname);
	}else{
		return false;
	}
	return newPath;
}

var inFix = (ext,type) => {
	
}

module.exports = {mkdir,rmdir,exists,copy,parse,remane,getFiles};