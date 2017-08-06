module.exports = fute => {
	              
	const Path    = require('path');
                  
	const iif     = fute.require('iif');
	const swig    = fute.require('swig');
	const marked  = fute.require('marked');
	const less    = fute.require('less');
	const imports = fute.require('imports');
	const uglify  = fute.require('uglify');
	const comment = fute.require('comment');
	const rename  = fute.require('rename');
	const replace = fute.require('replace');
	const Server  = fute.require('server');
	const clean   = fute.require('clean');
	              
	const task    = fute.task;
	const dest    = task.dest;
	const config  = fute.config;
	const path    = config.path;

	
	// 实例化http与socket服务
	const server =  Server({
		port:config.port, 
		open:config.openBrowser, 
		reload:config.reloadBrowser 
	});
	
	
	// 文件注释模板
	var commentTpl = `/**
 * ${config.name} v${config.version}
 * Copyright 2016-2017 ${config.author}
 * Released under the ${config.license} License
 * http://yangfei.name
 */\r\n`;
 
	
	// 源文件过滤
	var filter = fix => file => fix.indexOf(Path.extname(file.path))>-1;
	
	var isHtml = filter(['.html','.htm','.tpl']);
	var isJs = filter(['.js','.jsx']);
	var isCss = filter(['.less','.css']);
	
	
	// 过滤包含关键字的文件
	var nofix = suffix =>{
		return function(file){
			var extname = Path.extname(file.path);
			var basename = Path.basename(file.path, extname);
			return basename.lastIndexOf(suffix)<0
		}
	}
	
	// swig配置
	var swigOptions={
		defaults: {
			cache: false //禁止缓存
		},
		setup : swig => {
			marked.useTag(swig, 'markdown'); //解析markdown
		},
		data:config //数据
	};
	
	// 编译html到根目录
	task.add('html',()=>{
		return task.src(path.src.html)
			.pipe(iif(isHtml,swig(swigOptions)))
			.pipe(iif(isHtml,rename({extname:'.html'})))
			.pipe(dest(path.dist.root))
			.pipe(server.reload())
	});
	
	// 合并js
	task.add('js',()=>{
		return task.src(path.src.js)
			.pipe(iif(isJs,imports()))
			.pipe(iif(isJs,replace('__VERSION__', config.version)))
			.pipe(iif(isJs,comment(commentTpl)))
			.pipe(iif(isJs,rename({extname:'.js'})))
			.pipe(dest(path.dist.js))
			.pipe(server.reload())
	})
	
	// 使用less编译css
	task.add('css',()=>{
		return task.src(path.src.css)
			.pipe(iif(isCss,less()))
			.pipe(iif(isCss,comment(commentTpl)))
			.pipe(iif(isCss,rename({extname:'.css'})))
			.pipe(dest(path.dist.css))
			.pipe(server.reload('css'))
	})
	

	// 使用uglify压缩js, 排除 ${minifix} 文件
	task.add('jsmin', ()=>{
		return task.src([`${path.dist.js}/**/*.js`,`!${path.dist.js}/**/*${config.minifix}.js`])
			.pipe(uglify())
			.pipe(comment(commentTpl))
			.pipe(rename({suffix:config.minifix}))
			.pipe(dest(path.dist.js));
	});
	
	// 使用less压缩css, 排除 .min 文件
	task.add('cssmin',()=>{
		return task.src([`${path.dist.css}/**/*.css`,`!${path.dist.css}/**/*${config.minifix}.css`])
			.pipe(less(true))
			.pipe(comment(commentTpl))
			.pipe(rename({suffix:config.minifix}))
			.pipe(dest(path.dist.css))
	})
	
	// 压缩js和css
	task.add('mini',['jsmin','cssmin']);
	
	
	// 处理图片
	task.add('images',()=>{
		return task.src(path.src.images).pipe(dest(path.dist.images))
	})

	// 处理字体
	task.add('fonts',()=>{
		return task.src(path.src.fonts).pipe(dest(path.dist.fonts))
	})
	

	// 清除编译
	task.add('clean',()=>{
		return task.src(path.dist.root).pipe(clean())
	})
	

	// 监听文件变化，执行对应任务
	task.add('watch',()=> {
		if(!config.watch)return;
		task.watch(path.src.all.html, ['html']);
		task.watch(path.src.all.js, ['js']);
		task.watch(path.src.all.css, ['css']);
		task.watch(path.src.all.images, ['images']);
		task.watch(path.src.all.fonts, ['fonts']);
	})
	
	
	// 初始化http与socket服务
	task.add('server',()=>{
		task.src(path.dist.root).pipe(server.start())
	})
	
	// 合并编译任务
	task.add('build',['html','js','css','images','fonts']);
	
	//合并编译, 服务, 监听。 监听与服务在打包完成后执行
	task.add('default',['build'],function(){
		task.run('server');
		task.run('watch');
	});
};

