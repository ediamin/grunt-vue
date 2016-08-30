# grunt-vue

> Grunt task for compiling Vue.js files

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-vue --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-vue');
```

## The "vue" task

### Overview
In your project's Gruntfile, add a section named `vue` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  vue: {
    options: {
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
    },
    task1: {
        dest: 'vue-scripts.js',
        src: 'vue-scripts-src-dir',
    },
  },
});
```
