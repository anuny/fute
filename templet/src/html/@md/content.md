Markdown 语法测试
==
# blockquote
------
> * 整理知识，学习笔记
> * 发布日记，杂文，所见所想
> * 撰写发布技术文稿（代码支持）
> * 撰写发布学术论文（LaTeX 公式支持）
## 插入一张图片
![妹子不错哟](test/test.jpg)
## 插入一个链接
[链接1][1]
## 再插入一个链接
[链接2](http://jandan.net/ooxx) 
------
### 插入一段代码
``` javascript
require('plugins::highlight',function(highlight){
    var test = document.getElementById('test');
    var code = test.innerHTML
    highlight({
        element:test,
        style:'{light}',
        font:'font-size:14px; font-family:Consolas,Microsoft YaHei ',
        language:'javascript'
    })  
})
```
### 插入原生html
<div class=demo>
  <h1>1234456</h1>
</div>
### 加粗一段文字
**Markdown 是一种方便记忆、书写的纯文本标记语言**
*插入一段斜体文字*
[1]: http://google.com