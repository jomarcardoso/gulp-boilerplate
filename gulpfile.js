const babel = require('gulp-babel');
const browsersync = require('browser-sync').create();
const del = require('del');
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const webpackstream = require('webpack-stream');
const webpackconfig = require('./webpack.config.js');

let mode = 'development' // production || homologation

function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: './dist/'
    },
    port: 3000
  });
  done();
}

function browserSyncReload(done) {
  browsersync.reload();
  done();
}

function clean() {
  return del('./dist/');
}

function html() {
  return gulp
    .src('./assets/**/*.html')
    .pipe(gulp.dest('./dist/'))
    .pipe(browsersync.stream());
}

function css() {
  return gulp
    .src('./assets/css/**/*.scss')
    .pipe(plumber())
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(browsersync.stream());
}

function img() {
  return gulp
    .src('./assets/img/**/*')
    .pipe(newer('./dist/img/'))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest('./dist/img/'));
}

function js() {
  return gulp
    .src('./assets/js/**/*')
    .pipe(plumber())
    .pipe(webpackstream(webpackconfig))
    // folder only, filename is specified in webpack config
    .pipe(gulp.dest('./dist/js/'))
    .pipe(browsersync.stream())
  
}

function watchFiles() {
  gulp.watch('./assets/**/*.html', html);
  gulp.watch('./assets/css/**/*', css);
  gulp.watch('./assets/js/**/*', js);
  gulp.watch('./assets/img/**/*', img);
}

function babelize() {
  return gulp
  .src('./dist/js/**/*')
  .pipe(babel({ presets: ['@babel/env'] }))
  .pipe(uglify())
  .pipe(gulp.dest('./dist/js/'));
}

const watch = gulp.parallel(watchFiles, browserSync);

exports.build = gulp.series(gulp.parallel(css, img, js, html), babelize);

exports.buildhml = gulp.series((cb) => { 
    mode = 'homologation';
    cb();
  }, 
  gulp.parallel(css, img, js, html), babelize);

exports.buildprd = gulp.series((cb) => { 
    mode = 'production';
    cb();
  }, 
  gulp.parallel(css, img, js, html), babelize);


exports.default = gulp.series(gulp.parallel(css, img, js, html), watch);