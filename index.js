'use strict';

var through = require('through');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;
var path = require('path');

module.exports = function(filename) {
  if (!filename) {
    throw new PluginError('gulp-locale-merge', 'Missing filename');
  }

  var data = {};
  var firstFile = null;

  function bufferContents(file, b, c) {
    if (!firstFile) {
      firstFile = file;
    }

    var relative = path.relative(file.base, file.path);
    var basename = path.basename(file.path, '.json');
    var dirname = path.dirname(relative);

    if (file.isNull()) {
      return;
    }

    if (file.isStream()) {
      return this.emit('error', new PluginError('gulp-locale-merge', 'Streaming not supported'));
    }

    var keyPrefix = dirname.split('/').join('.') + '.';
    var content = JSON.parse(file.contents.toString());
    content && Object.keys(content).forEach(function(key) {
      if (!data[basename]) {
        data[basename] = {}
      }
      data[basename][keyPrefix + key] = content[key];
    });
  }

  function endStream() {
    var joinedPath = path.join(firstFile.base, filename);

    var joinedFile = new File({
      cwd: firstFile.cwd,
      base: firstFile.base,
      path: joinedPath,
      contents: new Buffer(JSON.stringify(data, null, 2))
    });

    console.log('end stream', JSON.stringify(data, null, 2));

    this.emit('data', joinedFile);
    this.emit('end');
  }

  return through(bufferContents, endStream);
}
