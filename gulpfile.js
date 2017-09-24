var gulp    = require('gulp'),
    rename  = require('gulp-rename'),
    uglify  = require('gulp-uglify'),
    del     = require('del');

gulp.task('clean', function() {
    return del(['dist']);
});

gulp.task('build', ['clean'], function() {
    gulp.src('src/*.js')
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify({
            preserveComments: 'license'
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
    gulp.watch('src/*.js', ['build']);
});

gulp.task('default', ['build']);