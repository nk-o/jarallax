const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const del = require('del');
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
 * Name    : Video Worker (wrapper for Youtube, Vimeo and Local videos)
 * Version : ${data.version}
 * Author  : ${data.author}
 * GitHub  : ${data.homepage}
 */
`;
}

gulp.task('clean', () => del(['dist']));

gulp.task('build', ['clean'], () => {
    gulp.src('src/*.js')
        .pipe($.babel({
            presets: ['env'],
            compact: false,
        }))
        .on('error', (error) => {
            console.error(error);
        })
        .pipe($.iife({
            useStrict: false,
        }))
        .on('error', (error) => {
            console.error(error);
        })
        .pipe($.if(file => file.path.match(/jarallax.js$/), $.header(getMainHeader())))
        .pipe($.if(file => file.path.match(/jarallax-video.js$/), $.header(getVideoHeader())))
        .pipe(gulp.dest('dist'))
        .pipe($.rename({ suffix: '.min' }))
        .pipe($.uglify({
            preserveComments: 'license',
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['build'], () => {
    gulp.watch('src/*.js', ['build']);
});

gulp.task('default', ['build']);
