'use strict';

const minimist = require('minimist'),
	  Path     = require('path'),
	  fs       = require('fs'),
	  util     = require('./util'),
	  task     = require('./task'),
	  usrDir   = process.cwd(),
	  tplDir   = Path.join(__dirname,'../templet/**/*'),
	  pkgFile  = Path.join(usrDir,'package.json'),
	  taskFile = Path.join(usrDir,'index.js'),
	  fute     = {},
	  packager = {},
	  config   = {},
	  base     = {},
	  path     = {};

let usrSrcFiles = [];
let usrSrcDir   = '';

// 获取参数
let arg = minimist(process.argv.slice(2))['_'][0];
	arg = (arg||'default').trim();

// 判断用户package
let hasPackageFile = util.file.exists(pkgFile);

// 判断用户task文件
let hasTaskFile = util.file.exists(taskFile);

// 创建项目
if(arg === 'init' && !hasPackageFile && !hasTaskFile){
	task.src(tplDir).pipe(task.dest(usrDir));
	return util.log.done(`The project has been created to "${usrDir}"`);
}

// 导入用户package
if(hasPackageFile){
	Object.assign(packager,require(pkgFile))
}else{
// 没有package
	util.log.error(`${pkgFile} does not exist. Please "init"`);
	process.exit();
}

// 没有task文件
if(!hasTaskFile){
	util.log.error(`"${taskFile}" does not exist. Please "init"`);
	process.exit();
}

// 用户配置
Object.assign(config,{
	name: packager.name || '',
	version: packager.version||'0.0.1',
	keywords:packager.keywords||'',
	description: packager.description||'',
	author: packager.author||'',
	license: packager.license||'MIT',
	port:packager.port||3000
})

// 扩展自定义配置
let futeConfig = packager.fute || {};
let extConfig = () => {

	// 浏览器事件配置
	let watch = futeConfig.watch === undefined ? true: futeConfig.watch;
	let openBrowser = futeConfig.openBrowser === undefined ? true: futeConfig.openBrowser;
	let reloadBrowser = futeConfig.reloadBrowser === undefined ? true: futeConfig.reloadBrowser;
	
	// 静态文件目录名称
	let ext = futeConfig.ext||{};

	// 静态文件目录名称
	let statics = futeConfig.statics||'static';

	// 源文件编译过滤
	let filter = futeConfig.filter;
	
	// 压缩文件后缀
	let minifix = futeConfig.minifix;
	
	usrSrcDir = Path.join(usrDir,futeConfig.src); 
	
	// 源路径与编译路径
	let src = './'+(futeConfig.src || 'src');
	let dist = './'+(futeConfig.dist || 'dist');
	
	// 扩展用户配置
	Object.assign(config,{watch,openBrowser,reloadBrowser,filter,statics,minifix,ext});
	
	// 扩展路径
	Object.assign(base,{src,dist});
}
extConfig();

// 静态文件路径
let staticPath = `${base.dist}/${config.statics}`

var creatPath = {
	src(type){
		let filter = config.filter||'';
		
		let src = [
			// 全部没有后缀的文件
			`${base.src}/${type}/**/*`,  
			// 全部有后缀的文件
			`${base.src}/${type}/**/*.*` 
		];
		// 过滤
		if(filter){
			let filterSrc = [
			//过滤没有后缀的文件
			`!${base.src}/${type}/${filter}**/*`, 
			//过滤所有文件夹
			`!${base.src}/${type}/${filter}**/**`,
			//过滤有后缀的文件
			`!${base.src}/${type}/**/${filter}*` 
			];
			src.push(...filterSrc);
		}
		return src;
	},
	all(type){
		return [
			`${base.src}/${type}/**/*`,
			`${base.src}/${type}/**/*.*`
		];
	},
	dist(type){
		return `${staticPath}/${type}`;
	},
	static(type){
		return `${config.statics}/${type}`;
	}
}

var getPath = (name,types) =>{
	let paths = {};
	types.forEach(function(type){
		paths[type] = creatPath[name](type);
	});
	return paths;
}

// 扫描读取源目录名
usrSrcFiles = util.file.getFiles(usrSrcDir)

// 源目录过滤配置关键标识
var srcPaths  = getPath('src',usrSrcFiles);

// 编译目录
var distPaths  = getPath('dist',usrSrcFiles);

// 源目录所有文件
var allPaths  = {all:getPath('all',usrSrcFiles)};

let staticPaths = {_:getPath('static',usrSrcFiles)}

// 源文件根目录
path.src = {
	root   : base.src
};

// 编译文件路径
path.dist = {
	root   : base.dist,
	html   : base.dist,
	statics: staticPath,
};

// 扩展源文件路径
Object.assign(path.src,srcPaths,allPaths);

// 扩展编译文件路径
Object.assign(path.dist,distPaths);

// 配置路径
Object.assign(config,staticPaths,{path});

// 导入扩展插件
var _require = name => {
	return require('./extend/'+name);
};

// 扩展fute
Object.assign(fute,{util, task, config, require:_require});


// 加载用户task
const userTask = require(taskFile);

// 执行用户task
'function' === typeof userTask && userTask.call(fute,fute);

// 执行用户task
if(arg in task.tasks){
	task.run(arg)
}else{
	util.log.error(`Task "${arg}" is not in your index.js . Please "add"`);
}

module.exports = fute;
