'use strict';

const gulp = require('gulp'),
		browserSync = require('browser-sync').create(),
		scss = require('gulp-sass'),
		autoprefixer = require('gulp-autoprefixer'),
		rename = require("gulp-rename"),
		del = require('del'),
		uglify = require("gulp-uglify"),
		cssnano = require('gulp-cssnano');


// BrowserSync
gulp.task('browser-sync', function() {
	browserSync.init({
  	proxy: 'loadmore.js',
  	notify: false,
  	browser: 'chrome'
  });
});

gulp.task('scss', function() {
    return gulp.src('demo/scss/**/*.scss')
    .pipe(scss({
    	outputStyle: "expanded",
			indentType: "tab", 
			indentWidth: 1
    })).pipe(autoprefixer({
            browsers: ['last 30 versions', '> 0.5%', 'ie 9-11'], // github.com/ai/browserslist#queries
        }))
    .pipe(gulp.dest('demo/css'))
    .pipe(browserSync.stream())
});

gulp.task('default', ['browser-sync', 'scss'], function() {
  gulp.watch('demo/scss/**/*.scss', ['scss']);
	gulp.watch('demo/**/*.js').on('change', browserSync.reload);
	gulp.watch('demo/**/*.+(html|php)').on('change', browserSync.reload);
});

gulp.task('build', ['deldist', 'scss'], function() {

	gulp.src([
		'demo/js/jquery.loadmore.js'
		])
	.pipe(gulp.dest('dist'));

	gulp.src('demo/js/jquery.loadmore.js')
	.pipe(uglify())
	.pipe(rename({ suffix: '.min' }))
	.pipe(gulp.dest('dist'));

	gulp.src(['demo/ajax-loadmore.php']).pipe(gulp.dest('dist/'));

});


gulp.task('deldist', function() {
  return del.sync('dist');
});