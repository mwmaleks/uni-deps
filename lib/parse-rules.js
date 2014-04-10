/**
 * @module parse-rules
 */
var utils = require('./utils')
    ;

/**
 * Parse function for ExtJs 4
 * @param string
 * @returns {*}
 */
function extJs4ParseRule (string) {

    var result = []
        , result_extend_match
        , result_require_match
        , rgxForExtend = /extend:\s*['"]{1}([^']*)['"]{1}/gim
        , rgxForRequire = /(requires\s*:\s*\[)([^\[\]]*)(\s*\])/gim
        , rgxForDocComments = /\/\*([^\*]|\*(?!\/))*\*(?=\/)/gim
        ;

    if ( !utils.isString(string) )
        return '[]';

    result_extend_match = string.replace(rgxForDocComments, '').match(rgxForExtend);

    if ( result_extend_match != null ) {
        result = result_extend_match.map(function (value) {
            return value.replace(rgxForExtend, '$1');
        });

    }

    result_require_match = string.match(rgxForRequire);

    if ( result_require_match != null ) {

        result_require_match.forEach(function (values) {
            var paths = values
                .replace(rgxForRequire, '$2')
                .split(',')
                .map(function(value) {
                    return value.trim().replace(/['"\r\n,]/gim, '');
                });

            result = result.concat(paths);
        });
    }
    return result;
}


module.exports = {
    extJs4ParseRule: extJs4ParseRule
};