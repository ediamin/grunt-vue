/*
 * grunt-vue
 * https://github.com/ediamin/grunt-vue
 *
 * Copyright (c) 2016 Edi Amin
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  var fs = require('fs');
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

    var vueDirs = ['mixins', 'transitions', 'filters', 'partials', 'directives', 'components'];

    // bail out if no destination js or source directory specified
    if (!this.data.dest) {
      grunt.log.warn('Destination script path is not specified.');
      return false;
    }

    if (!this.data.src) {
      grunt.log.warn('Source directory is not specified.');
      return false;
    } else if (!grunt.file.isDir(this.data.src)) {
      grunt.log.warn('Invalid source directory');
    }

    var srcDir = this.data.src;
    var subDirs = fs.readdirSync(srcDir);
    var vueScripts = [];
    var htmlTemplates = {};

    var includeOnly = this.data.includeOnly || {};
    var includeOnlyDirs = Object.keys(includeOnly);
    var exclude = this.data.exclude || {};

    if (includeOnlyDirs.length) {
      vueDirs = vueDirs.filter(function (dir) {
        return (includeOnlyDirs.indexOf(dir) >= 0);
      });
    }

    vueDirs.forEach(function (vueDir) {
      if (subDirs.indexOf(vueDir) >= 0) {
        var dir = path.format({
          dir: srcDir,
          base: vueDir
        });

        // for param like exclude.filters = 'all', do not proceed and move to next vueDir
        if ('all' === exclude[vueDir]) {
          return;
        }

        // dir except components
        if ('components' !== vueDir) {
          var files = [];

          if (includeOnlyDirs.length && 'all' !== includeOnly[vueDir]) {
            includeOnly[vueDir].forEach(function (file) {
              files.push(file + '.js');
            });

          } else {
            files = fs.readdirSync(dir);
          }

          files.forEach(function (file) {
            // we need js files only
            if ('.js' !== path.extname(file)) {
              return;
            }

            // include only if its not mentioned in exclude param
            if (!exclude[vueDir] || exclude[vueDir].indexOf(path.basename(file, '.js')) < 0) {
              vueScripts.push(dir + path.sep + file);
            }
          });

        // vue components
        } else {
          var components = [];

          if (includeOnlyDirs.length && 'all' !== includeOnly['components']) {
            components = includeOnly['components'];
          } else {
            components = fs.readdirSync(dir);
          }

          components.forEach(function (component) {
            var compDir = dir + path.sep + component;

            // if this component is in exclude param, then do not include
            if (!grunt.file.isDir(compDir) || (exclude[vueDir] && exclude[vueDir].indexOf(component) >= 0)) {
              return;
            }

            var contents = {
              js: compDir + path.sep + 'index.js',
              html: null
            };

            var template = compDir + path.sep + 'template.html';

            // if template.html exists then convert html to string
            if (grunt.file.isFile(template)) {
              contents.html = compileTemplate(template, options.quoteChar, options.indentString, options.htmlmin, options.process);
            }

            vueScripts.push(contents);
          });
        }

      }
    });

    // Iterate over all specified file groups.
    var srcCode = vueScripts.map(function(filepath) {
      var js = '';

      if (Object.prototype.toString.call(filepath) == "[object Object]") {
        js = grunt.file.read(filepath.js);

        if (filepath.html) {
          js = js.replace(/_TEMPLATE/, filepath.html);
        }

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
    grunt.log.writeln('Created ' + blue(this.data.dest) + ' ' + getSize(srcCode));

  });

};
