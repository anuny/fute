

const src = require('./src');
const dest = require('./dest');
const watch = require('./watch');

const orchestrator = require('orchestrator');
const inherits = require('util').inherits;


const Task = function () {
	orchestrator.call(this);
}

inherits(Task, orchestrator);

Task.prototype.run = function() {
	let tasks = arguments.length ? arguments : ['default'];
	this.start.apply(this, tasks);
};

Task.prototype.src = src;
Task.prototype.dest = dest;
Task.prototype.watch = watch

module.exports = new Task();

