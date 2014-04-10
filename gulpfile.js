/**
 * Created by mwmaleks on 07.04.14.
 */

var   gulp = require('gulp')
    , jsdoc = require('gulp-jsdoc')
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

gulp.task('generate-docs', function() {
    gulp.src('./lib/*.js')
        .pipe(jsdoc('./documentation'))
});

gulp.task('default', ['mocha']);