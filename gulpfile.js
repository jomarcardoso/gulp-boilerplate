const autoprefixer = require('gulp-autoprefixer');
const gulpBabel = require('gulp-babel');
const browsersync = require('browser-sync').create();
const cdnizer = require("gulp-cdnizer");
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const newer = require('gulp-newer');
const plumber = require('gulp-plumber');
const gulpSass = require('gulp-sass');
const gulpUglify = require('gulp-uglify');
const webpackstream = require('webpack-stream');
const webpackconfig = require('./webpack.config.js');
const gulpWebp = require('gulp-webp');

const NODE_ENV = process.env.NODE_ENV || 'development' // production || homologation

let completePath = '';
if (process.env.PWD) {
  completePath =  process.env.PWD.split('/');
} else {
  completePath =  process.env.INIT_CWD.split('/');
}

const FOLDER_NAME = completePath[completePath.length - 1];
const CDN = `https://${NODE_ENV === 'homologation' ? 'test-' : ''}secure-static.arezzo.com.br/content/${process.env.CDN}/${FOLDER_NAME}/`;
const CDN_FONTS = `https://${NODE_ENV === 'homologation' ? 'test' : 'www'}.arezzo.com.br/content/${process.env.CDN}/${FOLDER_NAME}/`;

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
      files: ['**/*.{gif,png,jpg,jpeg,css,js,svg}']
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
    .pipe(gulpSass({ outputStyle: 'expanded' }))
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
      files: ['**/*.{gif,png,jpg,jpeg,svg}']
    }))
    .pipe(cdnizer({
      defaultCDNBase: CDN_FONTS,
      files: ['**/*.{eot,woff,woff2,ttf}']
    }))
    .pipe(gulp.dest('./dist/css/'));
}

function cssMinify() {
  return gulp
    .src('./dist/css/**/*.css')
    .pipe(cleanCSS({compatibility: 'ie11'}))
    .pipe(gulp.dest('./dist/css/'));
}

function font() {
  return gulp
    .src('./assets/font/**/*')
    .pipe(gulp.dest('./dist/font/'))
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
        imageminMozjpeg({ quality: 85 }),
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

function webp() {
  return gulp
    .src('./assets/img/**/*')
    .pipe(gulpWebp({ quality: 86, method: 6,  }))
    .pipe(gulp.dest('./dist/img/'));
}

function js() {
  return gulp
    .src('./assets/js/**/*')
    .pipe(plumber())
    .pipe(webpackstream(webpackconfig))    
    .pipe(gulp.dest('./dist/js/'))
    .pipe(browsersync.stream());
}

function jsCdnizer() {
  return gulp
    .src('./dist/js/**/*.js')
    .pipe(cdnizer({
      defaultCDNBase: CDN,
      relativeRoot: 'js',
      files: ['**/*.{gif,png,jpg,jpeg,svg}']
    }))
    .pipe(gulp.dest('./dist/js/'));
}

function watchFiles() {
  gulp.watch('./assets/**/*.html', html);
  gulp.watch('./assets/css/**/*', css);
  gulp.watch('./assets/js/**/*', js);
  gulp.watch('./assets/img/**/*', img);
}

function babel() {
  return gulp
  .src('./dist/js/**/*')
  .pipe(gulpBabel({ presets: ['@babel/env'] }))
  .pipe(gulpUglify())
  .pipe(gulp.dest('./dist/js/'));
}

function moveBuild() {
  return gulp
    .src('./dist/**/*')
    .pipe(gulp.dest(`./dist/${NODE_ENV === 'production' ? 'prd': 'hml'}/`))
}

const watch = gulp.parallel(watchFiles, browserSync);
const dist = gulp.parallel(css, img, js, html, font, webp);

exports.build = gulp.series(
  clean,
  dist,
  gulp.parallel(cssCdnizer, htmlCdnizer, jsCdnizer),  
  gulp.parallel(babel, htmlMinify, cssMinify),
  moveBuild);

exports.default = gulp.series(clean, dist, watch); 