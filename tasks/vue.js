/*
 * grunt-vue
 * https://github.com/ediamin/grunt-vue
 *
 * Copyright (c) 2016 Edi Amin
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  var path = require('path');
  var minify = require('html-minifier').minify;

  var getSize = function (code) {
    return (code.length / 1024).toFixed(2) + 'kb';
  }

  var blue = function (str) {
    return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m';
  }

  var escapeContent = function(content, quoteChar, indentString) {
    var bsRegexp = new RegExp('\\\\', 'g');
    var quoteRegexp = new RegExp('\\' + quoteChar, 'g');
    var nlReplace = '\\n' + quoteChar + ' +\n' + indentString + indentString + quoteChar;
    return content.replace(bsRegexp, '\\\\').replace(quoteRegexp, '\\' + quoteChar).replace(/\r?\n/g, nlReplace);
  };

  // convert Windows file separator URL path separator
  var normalizePath = function(p) {
    if ( path.sep !== '/' ) {
      p = p.replace(/\\/g, '/');
    }
    return p;
  };

  // Warn on and remove invalid source files (if nonull was set).
  var existsFilter = function(filepath) {

    if (!grunt.file.exists(filepath)) {
      grunt.log.warn('Source file "' + filepath + '" not found.');
      return false;
    } else {
      return true;
    }
  };

  // return template content
  var getContent = function(filepath, quoteChar, indentString, htmlmin, process) {
    var content = grunt.file.read(filepath);

    // Process files as templates if requested.
    if (typeof process === "function") {
      content = process(content, filepath);
    } else if (process) {
      if (process === true) {
        process = {};
      }
      content = grunt.template.process(content, process);
    }

    if (Object.keys(htmlmin).length) {
      try {
        content = minify(content, htmlmin);
      } catch (err) {
        grunt.warn(filepath + '\n' + err);
      }
    }

    return escapeContent(content, quoteChar, indentString);
  };

  // compile a template to an angular module
  var compileTemplate = function(filepath, quoteChar, indentString, htmlmin, process) {
    var content = getContent(filepath, quoteChar, indentString, htmlmin, process);
    var module = quoteChar + content + quoteChar;

    return module;
  };

  grunt.registerMultiTask('vue', 'Grunt task for compiling Vue.js files', function() {

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      quoteChar: "'",
      htmlmin: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          removeAttributeQuotes: false,
          removeComments: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: false,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
      },
      indentString: '  ',
      process: false,
      separator: grunt.util.linefeed
    });

    var vueDirs = ['components', 'directives', 'filters', 'mixins', 'partials', 'transitions'];

    var i = 0;

    var jsFiles = [];
    var htmlTemplates = {};

    // bail out if no destination js or source directory specified
    if (!this.data.dest) {
      grunt.log.warn('Destination script path is not specified.');
      return false;
    }

    if (!this.data.src) {
      grunt.log.warn('Source directory is not specified.');
      return false;
    }

    grunt.file.recurse(this.data.src, function (abspath, rootdir, subdir, filename) {

      if ('.js' !== path.extname(abspath)) {
        return;
      }

      if (subdir) {
        var hierarchy = path.parse(subdir);

        if (vueDirs.indexOf(hierarchy.base) >= 0) {
          jsFiles.push(abspath);

        } else if ('components' === hierarchy.dir) {
          var dir = path.dirname(abspath);

          var htmlFile = path.format({
            dir: dir,
            base: 'template.html'
          });

          var component = {
            filepath: abspath,
            name: path.basename(dir),
            html: compileTemplate(htmlFile, options.quoteChar, options.indentString, options.htmlmin, options.process)
          };

          jsFiles.push(component);
        }

      }

    });

    // Iterate over all specified file groups.
    var srcCode = jsFiles.map(function(filepath) {
      var js = '';

      if (Object.prototype.toString.call(filepath) == "[object Object]") {
        js = grunt.file.read(filepath.filepath).replace(/_TEMPLATE/, filepath.html);
      } else {
        js = grunt.file.read(filepath);
      }

      return js;
    }).filter(function (code) {
      return code.length;
    }).join(grunt.util.normalizelf(options.separator));

    // Write the destination file.
    grunt.file.write(this.data.dest, srcCode);

    // Print a success message.
    // grunt.log.writeln('File "' + this.data.dest + '" created.');
    grunt.log.writeln('Created ' + blue(this.data.dest) + ' ' + getSize(srcCode));

  });

};
