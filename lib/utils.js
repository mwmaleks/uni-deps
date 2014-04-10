
/**
 * @module utils
 */

function isFunction(fn) {
    return Object.prototype.toString.call(fn) === '[object Function]';
}
function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}
function isString(str) {
    return Object.prototype.toString.call(str) === '[object String]';
}

function isArray(arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
}

/**
 * Does loop across the objects own properties
 * @param {Object} hash - target object
 * @param {Function} action - the action to perform on the element
 */
function forIn(hash, action) {

    for ( var key in hash ) {
        if (hash.hasOwnProperty(key)) {
            action(key, hash[key])
        }
    }
}

/**
 * Wraps array of path to be written into json file
 * @param {Array} srcPaths - array of passed is used
 * to pick value from arrays element custom way
 * @param {Function} picker - if passed us
 * @returns {string}
 */
function jsonWrapper(srcPaths, picker) {

    return '{ "files": [ \r\n'+ srcPaths.map(function(elem) {
        return '"' + ( picker ? picker(elem) : elem ) + '"';
    }).join(',\r\n') + '\r\n] }';
}


module.exports = {
    isFunction:     isFunction,
    isObject:       isObject,
    isString:       isString,
    isArray:        isArray,
    forIn:          forIn,
    jsonWrapper:    jsonWrapper
};