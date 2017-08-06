# 欢迎使用 Fute

------


### 安装使用

```bash
npm install fute -g
```

### 初始化项目

```bash
cd path to /demo
fute init
```

### 编辑模板文件 - 项目结构

```bash
root
|-- src // 源文件
|   |-- css // less文件
|   |-- fonts // 字体文件
|   |-- images // 图片文件
|   |-- js // javascript文件
|   |-- html // html模板
|   
|-- dist // 打包目录
|-- package.json // 项目配置
|-- index.js // 任务文件
```
### 生成项目文件到 /dist

```bash
fute || fute default
```

### 更多任务请参考 `index.js`


# 关于配置 package.json
``` javascript

"fute": {
    "port":3000, //开启服务端口
    "watch": true, // 监听文件变化
    "openBrowser": false, //开启服务后是否自动打开浏览器
	"reloadBrowser": true,//开启服务后是否自动刷新浏览器
    "src": "src", //源文件目录名
	"dist": "dist", //打包文件目录名
	"statics":"static", //打包静态文件目录名
	"filter": "@", // 过滤文件名以“@”开头的文件和目录
	"minifix":".mini" // 压缩文件后缀
  }
  
```

## License

MIT
