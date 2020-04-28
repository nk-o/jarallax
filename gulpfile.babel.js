const gulp = require( 'gulp' );
const $ = require( 'gulp-load-plugins' )();
const del = require( 'del' );
const browserSync = require( 'browser-sync' );
const named = require( 'vinyl-named' );
const webpack = require( 'webpack-stream' );
const qunit = require( 'node-qunit-phantomjs' );
const { data } = require( 'json-file' ).read( './package.json' );

const webpackconfig = require( './webpack.config.js' );

function getMainHeader() {
    return `/*!
 * Name    : Just Another Parallax [Jarallax]
 * Version : ${ data.version }
 * Author  : ${ data.author }
 * GitHub  : ${ data.homepage }
 */
`;
}
function getVideoHeader() {
    return `/*!
 * Name    : Video Background Extension for Jarallax
 * Version : 1.0.1
 * Author  : ${ data.author }
 * GitHub  : ${ data.homepage }
 */
`;
}
function getElementHeader() {
    return `/*!
 * Name    : DEPRECATED Elements Extension for Jarallax. Use laxxx instead https://github.com/alexfoxy/laxxx
 * Version : 1.0.0
 * Author  : ${ data.author }
 * GitHub  : ${ data.homepage }
 */
`;
}

/**
 * Error Handler for gulp-plumber
 */
function errorHandler( err ) {
    // eslint-disable-next-line no-console
    console.error( err );
    this.emit( 'end' );
}

/**
 * Clean Task
 */
gulp.task( 'clean', () => del( [ 'dist' ] ) );

/**
 * JS Task
 */
gulp.task( 'js', () => (
    gulp.src( [ 'src/*.js', '!src/*.esm.js' ] )
        .pipe( $.plumber( { errorHandler } ) )
        .pipe( named() )
        .pipe( webpack( {
            config: webpackconfig,
        } ) )
        .pipe( $.if( ( file ) => file.path.match( /jarallax.js$/ ), $.header( getMainHeader() ) ) )
        .pipe( $.if( ( file ) => file.path.match( /jarallax-video.js$/ ), $.header( getVideoHeader() ) ) )
        .pipe( $.if( ( file ) => file.path.match( /jarallax-element.js$/ ), $.header( getElementHeader() ) ) )
        .pipe( gulp.dest( 'dist' ) )
        .pipe( $.rename( { suffix: '.min' } ) )
        .pipe( $.uglify( {
            output: {
                comments: /^!/,
            },
        } ) )
        .pipe( $.sourcemaps.write( '.' ) )
        .pipe( gulp.dest( 'dist' ) )
        .pipe( browserSync.stream() )
) );

/**
 * CSS Task
 */
gulp.task( 'css', () => (
    gulp.src( 'src/*.css' )
        .pipe( gulp.dest( 'dist' ) )
        .pipe( browserSync.stream() )
) );


/**
 * BrowserSync Task
 */
gulp.task( 'browser_sync', ( cb ) => {
    browserSync.init( {
        server: {
            baseDir: [ 'demo', './' ],
        },
    } );

    cb();
} );

/**
 * Build (default) Task
 */
gulp.task( 'build', gulp.series( 'clean', [ 'js', 'css' ] ) );

/**
 * Watch Task
 */
gulp.task( 'dev', gulp.series( 'build', 'browser_sync', () => {
    gulp.watch( 'src/*.js', gulp.series( 'js' ) );
    gulp.watch( 'src/*.css', gulp.series( 'css' ) );
} ) );

gulp.task( 'default', gulp.series( 'build' ) );

/**
 * Test Task
 */
gulp.task( 'test', gulp.series( 'build', () => {
    qunit( './tests/index.html', {
        page: {
            viewportSize: { width: 1280, height: 800 },
        },
        'phantomjs-options': [ '--local-to-remote-url-access=true' ],
        // verbose: true,
        timeout: 15,
    } );
} ) );
