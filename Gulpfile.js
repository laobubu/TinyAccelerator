/**
 * Customized Gulpfile.
 * @author laobubu
 * 
 */

var gulp = require('gulp');
var changed = require('gulp-changed');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var htmlmin = require('gulp-htmlmin');
var runSequence = require('run-sequence');
var del = require('del');

var DEST = "dist/";
var SRC = "src/";

/** 
 * generate an array for gulp.src
 * 
 * @param {string} exts a string containing all the extension names, e.g. `"html, js, css"`
 * 
 * @returns {string[]} file paths
 * 
 * @example gulp.src(srclist('html, js, png, jpg, gif'))
 */
function srclist(exts, DIR) {
  var rtn = [], regex = /(\w+)/g, mat;
  while (mat = regex.exec(exts)) {
    rtn.push((DIR || SRC) + "**/*." + mat[1]);
  }
  return rtn;
}


gulp.task('default', () => runSequence('clean', 'build'));

gulp.task('clean', () => del([DEST]));

gulp.task('build', ['scss', 'static']);

gulp.task('uglify', ['uglify:js', 'uglify:css', 'uglify:html']);

gulp.task('scss', function () {
  return gulp.src(SRC + "/**/*.scss")
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(DEST));
});

gulp.task('static', function () {
  var src = srclist('scss', '!' + SRC);
  src.unshift(SRC + "**");
  return gulp.src(src)
    .pipe(changed(DEST))
    .pipe(gulp.dest(DEST));
});

gulp.task('uglify:js', ['build'], function(){
  return gulp.src(srclist("js", DEST))
      .pipe(uglify())
      .pipe(gulp.dest(DEST));
});

gulp.task('uglify:css', ['build'], function(){
  return gulp.src(srclist("css", DEST))
      .pipe(cssmin())
      .pipe(gulp.dest(DEST));
});

gulp.task('uglify:html', ['build'], function(){
  return gulp.src(srclist("html", DEST))
      .pipe(htmlmin({collapseWhitespace: true}))
      .pipe(gulp.dest(DEST));
});
