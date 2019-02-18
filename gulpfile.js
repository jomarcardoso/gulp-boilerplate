const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const browsersync = require('browser-sync').create();
const cdnizer = require("gulp-cdnizer");
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const webpackstream = require('webpack-stream');
const webpackconfig = require('./webpack.config.js');

const NODE_ENV = process.env.NODE_ENV || 'development' // production || homologation
const completePath =  process.env.PWD.split('/');
const FOLDER_NAME = completePath[completePath.length - 1];
const CDN = `https://${NODE_ENV === 'homologation' ? 'test-' : ''}secure-static.arezzo.com.br/content/${process.env.CDN}/${FOLDER_NAME}/`;

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

function htmlCdnizer() {
  return gulp
    .src('./dist/**/*.html')
    .pipe(cdnizer({
      defaultCDNBase: CDN,
      files: ['**/*.{gif,png,jpg,jpeg}']
    }))
    .pipe(gulp.dest('./dist/'));
}

function htmlMinify() {
  return gulp
    .src('./dist/**/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('./dist/'));
}

function css() {
  return gulp
    .src('./assets/css/**/*.scss')
    .pipe(plumber())
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      grid: 'autoplace'
    }))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(browsersync.stream());
}

function cssCdnizer() {
  return gulp
    .src('./dist/css/**/*.css')
    .pipe(cdnizer({
      defaultCDNBase: CDN,
      relativeRoot: 'css',
      files: ['**/*.{gif,png,jpg,jpeg}']
    }))
    .pipe(gulp.dest('./dist/css/'));
}

function cssMinify() {
  return gulp
    .src('./dist/css/**/*.css')
    .pipe(cleanCSS({compatibility: 'ie11'}))
    .pipe(gulp.dest('./dist/css/'));
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
    .pipe(browsersync.stream());
}

function jsCdnizer() {
  return gulp
    .src('./dist/js/**/*.js')
    .pipe(cdnizer({
      defaultCDNBase: CDN,
      relativeRoot: 'js',
      files: ['**/*.{gif,png,jpg,jpeg}']
    }))
    .pipe(gulp.dest('./dist/css/'));
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

exports.build = gulp.series(
  clean,
  gulp.parallel(css, img, js, html),
  gulp.parallel(cssCdnizer, htmlCdnizer, jsCdnizer),  
  gulp.parallel(babelize, htmlMinify, cssMinify));

exports.default = gulp.series(clean, gulp.parallel(css, img, js, html), watch); 