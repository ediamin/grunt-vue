# grunt-vue

> Grunt task for compiling Vue.js files

## Getting Started
If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-vue --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-vue');
```

## The "vue" task
```shell
grunt vue
```

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

        // compile all found in src directory
        task1: {
            dest: '/path/to/compiled-script.js',
            src: '/path/to/source/dir',
        },

        // compile specific js found in src directory
        task2: {
            dest: '/path/to/compiled-script.js',
            src: '/path/to/source/dir',
            includeOnly: {
                components: ['component1', 'component2'],
                directives: ['directive1', 'directive2'],
                mixins: 'all'
            }
        },

        // compile all except few specific js files
        task3: {
            dest: '/path/to/compiled-script.js',
            src: '/path/to/source/dir',
            exclude: {
                components: ['component3', 'component4'],
                directives: ['diretive3', 'directive4'],
                transitions: 'all'
            }
        }
    },
});
```

### Required directory structure

```shell
├── components
│   ├── component1
│   │   ├── index.js
│   │   ├── style.less
│   │   └── template.html
│   ├── component2
│   │   ├── index.js
│   │   ├── style.less
│   │   └── template.html
│   └── component3
│       ├── index.js
│       ├── style.less
│       └── template.html
├── directives
│   ├── directive1.js
├── filters
│   ├── filter1.js
│   ├── filter2.js
├── mixins
│   └── mixin1.js
├── partials
└── transitions
```

### Requirements for the components
For the component, you'll need index.js for the javascript and template.html for the template and add _TEMPLATE as the value for template property of your component definition

```js
Vue.component('mycomponent', {
    template: _TEMPLATE,
    ...
});
```

**css, less or sass will not auto-compiled right now.**