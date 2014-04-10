/**
 * Created by mwmaleks on 07.04.14.
 */

//var path = require('path');
var   gulp = require('gulp')
    , mocha = require('gulp-mocha')
    , gutil = require('gulp-util')
    , paths = {
        scripts: ['test/lib/uni-deps.test.js',
            'lib/*.js'],
        tests: ['test/lib/uni-deps.test.js']
    }
    ;

gulp.task('mocha', function() {
    return gulp.src(paths.tests, { read: false })
        .pipe(mocha({ reporter: 'spec' }))
        .on('error', gutil.log);
});
gulp.task('watch-mocha', function() {
    gulp.watch(paths.scripts, ['mocha']);
});
gulp.task('default', ['mocha']);