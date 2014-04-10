/**
 * @module path-hash
 *
 */
var   utils = require('./utils')
    , fs = require('fs')
    , rootDir  = process.cwd()
    , Path = require('path')
    ;

/**
 * Adds one dependant to result hash by key and list
 * @param {String} key - path of the module
 * @param {Array} list - list of the modules paths the module from key depends on
 * @method
 * @chainable
 */
function addDependant(key, list) {

    var   self = this
        , weight = list.length;

    self[key] = self[key] || {};
    self[key].weight = weight;

    list.forEach(function(elem) {

        self[elem] = self[elem] || {};
        if (!self[elem].dependant) {

            self[elem].dependant = [];
        }
        if (!( self[elem].dependant.indexOf(key) + 1 ))
            self[elem].dependant.push(key);
    });

    return this;
}

/**
 * Distributes weights to each the above dependant
 * @method
 * @chainable
 */
function distributeDependantWeights() {

    var   self = this
        , circularPreventArr
        ;

    utils.forIn(self, function(key, value) {

        circularPreventArr = [];

        var weight = self[key].weight;

        if (weight) {
            addWeight( value.dependant || [], weight);
        }

    });
    /**
     * Adds weight to all of the dependants
     * @param {Array} dependants - list of paths to dependants
     * @param weight - summarized amount of the dependencies
     * @method
     */
    function addWeight( dependants, weight) {

        dependants.forEach(function(dependant) {


            var w = self[dependant].weight;

            self[dependant].weight = w ? w + weight : weight;

            if ( self[dependant].dependant
                && ( self[dependant].dependant.length > 0 )
                && !(circularPreventArr.indexOf(dependant) + 1)) {

                    circularPreventArr.push(dependant);
                    addWeight(self[dependant].dependant, weight);
            }
        });
    }
    return this;
}

/**
 * Modifies hash to sorted array of deps paths by weight
 * @method
 * @chainable
 */
function sortDependencies() {

    var _arr = []
        ;
    utils.forIn(this, function(key, val) {
        _arr.push({
            path: key,
            weight: val.weight || 0
        })
    });
    _arr.sort(function(a, b) {
       return a.weight - b.weight;
    });
    this.pathsArr = _arr;
    return this;
}

/**
 * Saves all of the dependencies to "common.deps"
 * @param {Object} options
 * @param {String} [options.baseDir] - folder to save the file
 * @param {String} [options.fileName] - custom file name (defaults to "common.deps")
 * @param {String} [options.ext] - file extension
 * @param {Function} callback
 * @chainable
 * @method
 */
function saveJointFile(options, callback) {


    var   fileName = options.fileName ? options.fileName : 'common.deps'
            + ( options.ext ? options.ext : '.json' )

        , target = !(options.baseDir.indexOf(rootDir) + 1)
            ? Path.join(rootDir, options.baseDir, fileName)
            : Path.join(options.baseDir, fileName)
        ;

    fs.writeFile(
        target,
        utils.jsonWrapper(this.pathsArr, function(elem) {
            return elem.path;
        }),
        function(err) {
            callback(err ? err : undefined);
        }
    );
}

/**
 *
 * Creates path hash object
 * @constructor
 */
var PathHash = function() {

};

PathHash.prototype = {

    /**
     * Adds one dependant to result hash by key and list
     * @param {String} key - path of the module
     * @param {Array} list - list of the modules paths the module from key depends on
     * @method
     * @chainable
     */
    addDependant: addDependant,

    /**
     * Distribute weights to each above dependant
     * @method
     * @chainable
     *
     */
    distributeDependantWeights: distributeDependantWeights,

    /**
     * Modifies hash to sorted array of deps paths by weight
     * @method
     * @chainable
     */
    sortDependencies: sortDependencies,

    /**
     * Saves common.deps file with main dependencies
     * @param {Object} options
     * @param {String} [options.baseDir] - folder to save the file
     * @param {String} [options.fileName] - custom file name (defaults to "common.deps")
     * @param {String} [options.ext] - file extension
     * @param {Function} callback
     * @chainable
     * @method
     */
    saveJointFile: saveJointFile
};

module.exports = PathHash;