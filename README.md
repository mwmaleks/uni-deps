# uni-deps

##### Creates a dependency file regarding projects fils content

### Install
```
npm install uni-deps
```
### Description

The search is recursive. The result is the list of paths to the projects files sorted
in order to increase dependecies degree, counted by a weighted graph.

It is possible to use the custom function of the file content  parsing and custom function of the dependencies encoding. 
By default `extJs4ParseRule` function used to parse file content, and `extDepsEncoder` to encode dependencies from
`Ext.js.style` to `/ext/js/style`

### Example dependecies struture

folders structure:
```

test/
        ext/
                domain/
                        Component.js
                        Controller.js
                        Global.js
                        Store.js
                Application.js
                Controller.js
        extjs-app.js
        
```

extjs-app.js:
```js
...
var Ext = {
    define: function() {}
};

Ext.define('Ext.app.Application', {
    ...
    extend: 'Ext.app.Controller'
    ...
});
```
Controller.js:
```js
...
Ext.define('Ext.app.Controller', {
    requires: [
        'Ext.app.domain.Global',
        'Ext.app.domain.Component',
        'Ext.app.domain.Store'
    ]
    ...
});
...

```
And so on (see example in this repo)
The result of the work will be the `common.deps.json` file:
```json
{ "files": [ 
    "test/sample/ext/app/domain/Global.js",
    "test/sample/ext/app/EventDomain.js",
    "test/sample/ext/app/domain/Component.js",
    "test/sample/ext/app/domain/Store.js",
    "test/sample/ext/app/Controller.js",
    "test/sample/extjs-app.js"
] }
```

### Usage

```js
var searchDeps = require('uni-deps'). searchDeps;

var options = {

            baseDir: 'test/sample',
            fileName: 'myCommonFile',
            ext: '.json'
        };

searchDeps('test/sample/extjs-app.js', options, function() {
  console.log('done');
});
```

### Options description


* `baseDir:` the base point directory
* `parseRule:` function that provides the custom rule for the source file to parse
* `manyFiles:` if `true` should save deps files for each component that has dependencies
* `fileName:` custom result file name (defaults to "common.deps")
* `ext:` "common.deps" file extension (defaults to ".json")
