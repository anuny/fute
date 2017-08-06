const gwatch = require('glob-watcher');

var watch = function(glob, opt, fn)  {
  if (typeof opt === 'function' || Array.isArray(opt)) {
    fn = opt;
    opt = null;
  }

  if (Array.isArray(fn)) {
    return gwatch(glob, opt, function() {
      this.start.apply(this, fn);
    }.bind(this));
  }

  return gwatch(glob, opt, fn);
};
module.exports = watch;