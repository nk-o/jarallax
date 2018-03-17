const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const del = require('del');
const path = require('path');
const fs = require('fs');
const browserSync = require('browser-sync');
const named = require('vinyl-named');
const webpack = require('webpack-stream');
const qunit = require('node-qunit-phantomjs');
const data = require('json-file').read('./package.json').data;

function getMainHeader() {
    return `/*!
 * Name    : Just Another Parallax [Jarallax]
 * Version : ${data.version}
 * Author  : ${data.author}
 * GitHub  : ${data.homepage}
 */
`;
}
function getVideoHeader() {
    return `/*!
 * Name    : Video Background Extension for Jarallax
 * Version : 1.0.1
 * Author  : ${data.author}
 * GitHub  : ${data.homepage}
 */
`;
}
function getElementHeader() {
    return `/*!
 * Name    : Elements Extension for Jarallax
 * Version : 1.0.0
 * Author  : ${data.author}
 * GitHub  : ${data.homepage}
 */
`;
}

/**
 * Error Handler for gulp-plumber
 */
function errorHandler(err) {
    console.error(err);
    this.emit('end');
}

/**
 * Clean Task
 */
gulp.task('clean', () => del(['dist']));

/**
 * JS Task
 */
gulp.task('js', () => {
    return gulp.src(['src/*.js', '!src/*.esm.js'])
        .pipe($.plumber({ errorHandler }))
        .pipe(named())
        .pipe(webpack({
            module: {
                loaders: [
                    {
                        test: /\.js$/,
                        use: [{
                            loader: 'babel-loader',
                        }],
                    },
                ],
            },
        }))
        .pipe($.if(file => file.path.match(/jarallax.js$/), $.header(getMainHeader())))
        .pipe($.if(file => file.path.match(/jarallax-video.js$/), $.header(getVideoHeader())))
        .pipe($.if(file => file.path.match(/jarallax-element.js$/), $.header(getElementHeader())))
        .pipe(gulp.dest('dist'))
        .pipe($.rename({ suffix: '.min' }))
        .pipe($.uglify({
            output: {
                comments: /^!/,
            },
        }))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream());
});

/**
 * CSS Task
 */
gulp.task('css', () => {
    return gulp.src('src/*.css')
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream());
});


/**
 * BrowserSync Task
 */
gulp.task('browser_sync', () => {
    browserSync.init({
        server: {
            baseDir: ['demo', './'],
        },
    });
});

/**
 * Watch Task
 */
gulp.task('dev', () => {
    $.sequence('browser_sync', 'build', () => {
        gulp.watch('src/*.js', ['js']);
        gulp.watch('src/*.css', ['css']);
    });
});

/**
 * Build (default) Task
 */
gulp.task('build', (cb) => {
    $.sequence('clean', ['js', 'css'], cb);
});

gulp.task('default', ['build']);

/**
 * Test Task
 */
gulp.task('test', ['build'], () => {
    qunit('./tests/index.html', {
        page: {
            viewportSize: { width: 1280, height: 800 },
        },
        'phantomjs-options': ['--local-to-remote-url-access=true'],
        // verbose: true,
        timeout: 15,
    });
});
