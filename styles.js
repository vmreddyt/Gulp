'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var concatCss = require('gulp-concat-css');

var browserSync = require('browser-sync');

var $ = require('gulp-load-plugins')();

var wiredep = require('wiredep').stream;
var _ = require('lodash');

gulp.task('styles-reload', ['styles'], function() {
  return buildStyles()
    .pipe(browserSync.stream());
});

gulp.task('styles-reload-vendor', ['stylesVendor'], function() {
  return buildStylesVendor()
    .pipe(browserSync.stream());
});
gulp.task('styles', function() {
  return buildStyles();
});

gulp.task('stylesVendor', function() {
  return buildStylesVendor();
});

var buildStyles = function() {
  var lessOptions = {
    options: [
      'bower_components',
      path.join(conf.paths.src, '/app')
    ]
  };

  var injectFiles = gulp.src([
    path.join(conf.paths.src, '/assets/less/custom/**/*.less'),
  ], { read: false });

  var injectOptions = {
    transform: function(filePath) {
      filePath = filePath.replace(conf.paths.src + '/assets/less/custom/', '');
      return '@import "' + filePath + '";';
    },
    starttag: '// injector',
    endtag: '// endinjector',
    addRootSlash: false
  };

  return gulp.src([
    path.join(conf.paths.src, '/assets/less/custom/**/*.less')
  ])
    .pipe($.inject(injectFiles, injectOptions))
    .pipe(wiredep(_.extend({}, conf.wiredep)))
    .pipe($.sourcemaps.init())
    .pipe($.less(lessOptions)).on('error', conf.errorHandler('Less'))
    .pipe($.autoprefixer()).on('error', conf.errorHandler('Autoprefixer'))
    .pipe(concatCss("styles.css"))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app/')));
};


var buildStylesVendor = function() {
  var lessOptions = {
    options: [
      'bower_components',
      path.join(conf.paths.src, '/app')
    ]
  };

  var injectFilesVendor = gulp.src([
    path.join(conf.paths.src, '/assets/less/vendors/**/*.less'),
    
    path.join('!' + conf.paths.src, '/assets/less/vendors/vendors.less')
  ], { read: false });
  var injectOptionsVendor = {
    transform: function(filePath) {
      filePath = filePath.replace(conf.paths.src + '/assets/less/vendors/', '');
      return '@import "' + filePath + '";';
    },
    starttag: '// injector',
    endtag: '// endinjector',
    addRootSlash: false
  };


  return gulp.src([
    path.join(conf.paths.src,'/assets/less/vendors/vendors.less'),
    path.join(conf.paths.src, '/fonts/livehive_fonts/style.css'),
  ])
    .pipe($.inject(injectFilesVendor, injectOptionsVendor))
    .pipe(wiredep(_.extend({}, conf.wiredep)))
    .pipe($.sourcemaps.init())
    .pipe($.less(lessOptions)).on('error', conf.errorHandler('Less'))
    .pipe($.autoprefixer()).on('error', conf.errorHandler('Autoprefixer'))
    .pipe(concatCss("bundleVendors.css")) 
    .pipe($.replace('../../../fonts/livehive_fonts', '../fonts/livehive_fonts'))
    .pipe($.replace('../../../fonts/fontawesome', '../fonts/fontawesome'))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app/')));
};