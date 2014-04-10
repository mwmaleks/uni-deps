/**
 * @module encoders
 *
 */

var Path = require('path');

/**
 * Returns the string of encoded to json array of ext.js dependencies
 *
 * @param {Array} srcPaths - array of extJs style dependencies
 * @param {String} srcDir - Dir of initial point to search dependencies
 * @returns {Array} - array of the valid unix paths
 */
function extDepsEncoder(srcPaths, srcDir) {

    return srcPaths.map(function(elem) {
        var _tmpPath = elem.replace(/\./g, '/').replace(/^[E]/, 'e') + '.js';
        return srcDir ? Path.join(srcDir, _tmpPath): _tmpPath;
    });
}
module.exports = {
    extDepsEncoder: extDepsEncoder
};