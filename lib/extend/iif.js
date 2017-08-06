const Log = require('../util').log;
const Through = require('through2');
const TernaryStream = require('ternary-stream');

const match = (file, condition, options)=>{
	if (!file) {
		Log.error('fute-extend-iif: match file required');
	}

	if (typeof condition === 'boolean') {
		return condition;
	}

	if (typeof condition === 'function') {
		return !!condition(file);
	}
}

module.exports =  (condition, pass, fail=Through.obj({}), options) =>{
	
	if (!pass) {
		Log.error('fute-extend-iif: pass action is required');
	}
	
	if (typeof condition === 'boolean') {
		return condition ? pass : fail;
	}
	
	var classifier = file => {
		return !!match(file, condition, options);
	}

	return TernaryStream(classifier, pass, fail);
};