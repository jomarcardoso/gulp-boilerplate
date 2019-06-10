const autoprefixer = require('gulp-autoprefixer');
const browsersync = require('browser-sync').create();
const gulpCdnizer = require("gulp-cdnizer");
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const fs = require('fs');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const plumber = require('gulp-plumber');
const gulpPug = require('gulp-pug');
const gulpSass = require('gulp-sass');
const gulpUglify = require('gulp-uglify');
const webpackstream = require('webpack-stream');
const gulpJsonminify = require('gulp-jsonminify');

const { CDN_LOCAL } = process.env; // to run on local environment
const { NODE_ENV = 'development' } = process.env // production || homologation

let webpackconfig = require('./webpack.dev.js');
if (NODE_ENV === 'homologation') {
  webpackconfig = require('./webpack.hml.js');
} else if (NODE_ENV === 'production') {
  webpackconfig = require('./webpack.prd.js');
}

const port = '3015';
const localPath = `http://localhost:${port}`;
const { PATH_CDN = localPath } = process.env;
const { PATH_STATIC = localPath } = process.env;

function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: './dist/'
    },
    port
  });
  done();
}

function clean() {
  return del('./dist/');
}

function pug() {
  return gulp
    .src('./src/index.pug')
    .pipe(gulpPug())
    .pipe(gulp.dest('./dist/'))
    .pipe(browsersync.stream());
}

function html() {
  if (fs.existsSync('./src/index.pug')) return pug();

  return gulp
    .src('./src/**/*.html')
    .pipe(gulp.dest('./dist/'))
    .pipe(browsersync.stream());
}

function htmlCdnizer() {
  const matchers = [
    /(<source\s.*?srcset=["'])(.+?)(["'].*?>)/gi, // to picture/source
    // /(<img\s.*?data-src=["'])(.+?)(["'].*?>)/gi, // to lazy-load
    /(<a\s.*?href=["'])(.+?)(["'].*?>)/gi,
    /(<img\s.*?data-load=["'])(.+?)(["'].*?>)/gi // to load-image
  ];

  return gulp
    .src('./dist/**/*.html')
    .pipe(gulpCdnizer({
      defaultCDNBase: PATH_CDN,
      relativeRoot: '/',
      files: ['**/*.{css,js}'],
    }))
    .pipe(gulpCdnizer({
      defaultCDNBase: PATH_CDN,
      relativeRoot: '/',
      files: ['**/cdn/**/*.{gif,png,jpg,jpeg,css,js,svg}'],
      matchers
    }))
    .pipe(gulpCdnizer({
      defaultCDNBase: PATH_STATIC,
      relativeRoot: '/',
      files: ['**/static/**/*.{gif,png,jpg,jpeg,css,js,svg}'],
      matchers: [

      ]
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
    .src('./src/css/**/*.scss')
    .pipe(plumber())
    .pipe(gulpSass({
      outputStyle: 'expanded',
    }).on('error', gulpSass.logError))
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
    .pipe(gulpCdnizer({
      defaultCDNBase: PATH_CDN,
      relativeRoot: '/css',
      files: ['**/cdn/**/*.{gif,png,jpg,jpeg,svg}']
    }))
    .pipe(gulpCdnizer({
      defaultCDNBase: PATH_STATIC,
      relativeRoot: '/css',
      files: ['**/*.{eot,woff,woff2,ttf,eot?#iefix}', '**/static/**/*.{gif,png,jpg,jpeg,svg}']
    }))
    .pipe(gulp.dest('./dist/css/'));
}

function cssMinify() {
  return gulp
    .src('./dist/css/**/*.css')
    .pipe(cleanCSS({compatibility: 'ie11'}))
    .pipe(gulp.dest('./dist/css/'));
}

function cssVendors() {
  return gulp
    .src('./src/css/vendors/**/*.css')
    .pipe(gulp.dest('./dist/css/vendors'))
    .pipe(browsersync.stream());
}

function font() {
  return gulp
    .src('./src/font/**/*')
    .pipe(gulp.dest('./dist/font/'))
    .pipe(browsersync.stream());
}

function img() {
  return gulp
    .src('./src/img/**/*')
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
    .src('./src/js/index.js')
    .pipe(webpackstream(webpackconfig))
    .pipe(gulp.dest('./dist/js/'))
    .pipe(browsersync.stream());
}

function jsCdnizer() {
  return gulp
    .src('./dist/js/**/*.js')
    .pipe(gulpCdnizer({
      defaultCDNBase: PATH_CDN,
      relativeRoot: '/js',
      files: ['**/*.{gif,png,jpg,jpeg,svg}']
    }))
    .pipe(gulp.dest('./dist/js/'));
}

function jsVendors() {
  return gulp
    .src('./src/js/vendors/**/*.js')
    .pipe(gulp.dest('./dist/js/vendors/'))
    .pipe(browsersync.stream());
}

function json() {
  return gulp
  .src('./src/**/*.json')
  .pipe(gulpJsonminify())
  .pipe(gulp.dest('./dist/'))
  .pipe(browsersync.stream());
}

function watchFiles() {
  gulp.watch('./src/**/*.pug', pug);
  gulp.watch('./src/**/*.html', html);
  gulp.watch(['./src/css/**/*', '!./src/css/vendors/**/*'], css);
  gulp.watch('./src/css/vendors/**/*.css', cssVendors);
  gulp.watch(['./src/js/**/*', '!./src/js/vendors/**/*'], js);
  gulp.watch('./src/js/vendors/**/*.js', jsVendors);
  gulp.watch('./src/**/*.json', json);
  gulp.watch('./src/img/**/*', img);
  gulp.watch('./src/font/**/*', font);
}

function jsMinify() {
  return gulp
  .src('./dist/js/**/*')
  .pipe(gulpUglify())
  .pipe(gulp.dest('./dist/js/'));
}

const watch = gulp.parallel(watchFiles, browserSync);
const dist = gulp.parallel(css, cssVendors, img, js, jsVendors, json, html, font);
const minify = gulp.parallel(jsMinify, htmlMinify, cssMinify);
const cdnizer = gulp.parallel(cssCdnizer, htmlCdnizer, jsCdnizer);

exports.build = gulp.series( clean, dist, minify);
exports.default = gulp.series(clean, dist, watch);

if (NODE_ENV === 'homologation' || NODE_ENV === 'production') {
  exports.build = gulp.series(clean, dist, cdnizer, minify);
}

if (CDN_LOCAL) {
  exports.default = gulp.series(clean, dist, cdnizer, watch);
}

