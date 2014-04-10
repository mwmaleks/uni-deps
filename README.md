# uni-deps

##### The library serve for searching dependencies across the project files.

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


        'module1' depends on ['module7', 'module4', 'module5','module8', 'module6', 'module3']
        'module2' depends on ['module4', 'module5', 'module9','module3']
        'module3' depends on ['module7', 'module5', 'module6']
        'module4' depends on ['module5', 'module3', 'module6']


```
        folders structure
            
            test/
                folder1/
                    module1
                    module2
                    module3
                    module4
            
                    folder/
                        module5
                        module6
                        module7
                        module8
                        module9
```
the result file will be:

```

{ "files": [ 
"test/folder1/folder2/module7",
"test/folder1/folder2/module5",
"test/folder1/folder2/module8",
"test/folder1/folder2/module6",
"test/folder1/folder2/module9",
"test/folder1/module3"
"test/folder1/module4"
"test/folder1/module2"
"test/folder1/module1"
] }
```


### Usage

```js
var searchDeps = require('uni-deps'). searchDeps;

var options = {

            baseDir: pathJoin('test/sample'),
            fileName: 'myCommonFile',
            ext: '.json'
        };

searchDeps('test/sample/extjs-app.js', options, function() {
  console.log('done');
});
```
