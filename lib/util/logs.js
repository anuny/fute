const colors = require('colors');
const log = {
	done(msg){
		console.log('[ Done ]'.green, msg);
	},
	info(msg){
		console.log('[ Info ]'.cyan, msg);
	},
	warn(msg){
		console.log('[ Warn ]'.yellow, msg);
	},
	error(msg){
		console.log('[ Error ]'.red, msg);
	}
	
};
module.exports = log;