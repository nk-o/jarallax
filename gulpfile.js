var gulp    = require('gulp'),
    rename  = require('gulp-rename'),
    uglify  = require('gulp-uglify'),
    del     = require('del');

gulp.task('clean', function() {
    return del(['dist']);
});

gulp.task('build', ['clean'], function() {
    gulp.src('jarallax/*.js')
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify({
            preserveComments: 'license'
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
    gulp.watch('jarallax/*.js', ['build']);
});

gulp.task('default', ['build']);