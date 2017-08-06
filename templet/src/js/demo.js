!function (win, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        win.demo = factory();
    }
}(window, function () {
	//=require @header.js
	//=require @body.js
	//=require @footer.js 
});