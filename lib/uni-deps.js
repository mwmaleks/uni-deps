/**
 * @module search-deps
 */

'use strict';
var   utils = require('./utils')
    , fs = require('fs')
    , rootDir  = process.cwd()
    , Path = require('path')
    , async = require('async')
    , PathsHash = require('./paths-hash')
    , parseRules = require('./parse-rules')
    , encoders = require('./encoders')
    , pathHash
;

/**
 * This function performs run of the parseRule rule function with passed content
 * and checks if result of the parseRule function is correct
 *
 * @param {String} content -  content to be parsed
 * @param {String|Function} parseRule - if passed string - it should be a name pre defined
 * in parse-rule module function which makes parsing, defaults to extJs4ParseRule.
 * If passed function - parseDeps will use it as parse rule.
 */
function parseDeps(content, parseRule) {

    var   result
        , preDefinedRules = ['extJs4ParseRule']
        ;

    if (!( utils.isString(content) && ( utils.isFunction(parseRule) || ( preDefinedRules.indexOf(parseRule) + 1 ))))

        throw 'Incorrect parameters: it should be parse rule function and content type String';

    parseRule = utils.isString(parseRule) ? parseRules[parseRule] : parseRule;


    result = parseRule(content);

    if ( !utils.isArray(result) )
        throw 'parseRule function returns incorrect result. It should be and array of valid path to file';

    result.forEach(function(elem) {

        if (!/(\/{0,1}(((\w)|(\.)|(\\\s))+\/)*((\w)|(\.)|(\\\s))+)|\//.test(elem) || ( elem.length === 0 ))
            throw 'parseRule function returns incorrect result. It should be and array of valid path to file';
    });
    return result;
}

/**
 * Recursively searches dependencies in file "path" using parseRule function passed in options
 * and if dependencies found writes them to ".deps." file.
 *
 * @param {String} srcPath - path to file dependencies to find in
 * @param {Object} options
 * @param {String} [options.baseDir] - the base point directory
 * @param {Function} [options.parseRule] - function that provides custom rule for source file to parse
 * @param {Boolean} [options.manyFiles] - should saves deps file for each component that has dependencies
 * @param {String} [options.fileName] - custom file name (defaults to "common.deps")
 * @param {String} [options.ext] - "common.deps" file extension (defaults to ".json")
 * @param {Function} callback - callback function
 */
function searchDeps(srcPath, options, callback) {

    var   mainResult = {}
        , encoder = options.depsEncoder || encoders.extDepsEncoder
        , initPointDir = options.baseDir
        ;

    pathHash = new PathsHash();

    /**
     * Private function searches dependencies in file "path" recursively
     *
     * @param {String} srcPath
     * @param {Object} options
     * @param {String} [options.baseDir] - the base point directory
     * @param {Function} [options.parseRule] - function that provides custom rule for source file to parse
     * @param {Boolean} [options.manyFiles] - should saves deps file for each component that has dependencies
     * @param {Function} callback - callback function
     * @private
     */
    function __searchDeps(srcPath, options, callback) {

        if ( utils.isFunction(options) ) {

            callback = options;
        }

        var parseRule = utils.isObject(options)
            ? options.parseRule || parseRules['extJs4ParseRule']
            : parseRules['extJs4ParseRule'];

        fs.exists(srcPath, function(exists) {

            if (!exists) {

                callback();
                return;
            }

            getContent(srcPath, function(content, srcDir) {

                var   resultPaths = parseRule(content)
                    , _path
                    ;

                /**
                 * Check if path already exist in mainResult
                 * @param srcPath
                 * @returns {boolean}
                 */
                function checkCircularDep(srcPath) {

                    var condition = false;

                    for ( var prop in mainResult) {

                        if ( mainResult.hasOwnProperty(prop) ) {

                            if ( prop === srcPath ) {
                                condition = true;
                                break;
                            }
                        }

                    }
                    return condition;
                }

                if ( resultPaths.length > 0 ) {

                    /* for the first time remember initPointDir */
                    initPointDir = initPointDir || srcDir;

                    _path = ( srcPath.indexOf(rootDir) + 1 )
                        ? srcPath
                        : Path.join(rootDir, srcPath);

                    if (checkCircularDep(_path)) {
                        callback();
                        return;
                    }


                    mainResult[_path] = encoder(resultPaths, initPointDir);

                    pathHash.addDependant( _path, mainResult[_path] );

                    async.each(mainResult[_path], function(srcPth, callback) {

                        __searchDeps(srcPth, options, callback);

                    }, callback);

                    options.manyFiles && createDepsFile({

                        path: srcPath,

                        pathsArray: mainResult[_path],

                        callback: function() {}
                    });

                    return;
                }
                callback();
            });
        });
    }
    __searchDeps(srcPath, options, function() {
        pathHash
            .distributeDependantWeights()
            .sortDependencies()
            .saveJointFile( options, function() {
                callback(mainResult, pathHash);
            });
    });
}

/**
 * Reads content from file if it exists
 *
 * @param {String} srcPath -  path/to/file
 * @param {Function} callback - function to call after content is read
 */
function getContent(srcPath, callback) {

    if (!(srcPath.indexOf(rootDir) + 1 )) {
        srcPath = Path.join(rootDir, srcPath);
    }
    fs.readFile(srcPath, function(err, data) {
        if (err)
            throw err;
        callback(data.toString(), Path.dirname(srcPath));
    });
}

/**
 * Creates deps file with passed options
 *
 * @param {Object} options
 *
 * @param {String} [options.path] - path to get base name for to use in deps file name,
 * and dir name to write deps file into
 *
 * @param {Array} [options.pathsArray] -  an array of paths to the files with the found dependencies
 *
 * @param {Function} [options.callback] - callback function
 *
 * @param {Function} [options.depsEncoder] - function to encode the deps file
 *  Defaults to encoders.extDepsEncoder
 */
function createDepsFile(options) {

    var   srcDir = Path.dirname(options.path)

        , extension = Path.extname(options.path)

        , base = Path.basename(options.path, extension)


        , targetFile = Path.join(!( srcDir.indexOf(rootDir) + 1 )
            ? Path.join(rootDir, srcDir)
            : srcDir , [base, 'deps', 'json'].join('.'))
        ;

    fs.existsSync(targetFile) && fs.unlinkSync(targetFile);

    fs.writeFile(
        targetFile,
        utils.jsonWrapper(options.pathsArray),
        function(err) {

            if (err) {
                options.callback(err);
                return;
            }
            options.callback();
    });
}

module.exports = {
    parseDeps:          parseDeps,
    searchDeps:         searchDeps,
    getContent:         getContent,
    createDepsFile:     createDepsFile
};


