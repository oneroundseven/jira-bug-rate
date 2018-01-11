// Copyright 2018 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

var gulp    = require('gulp');
var gutil   = require('gulp-util');
var uglify  = require('gulp-uglify');
var concat  = require('gulp-concat');

gulp.task('default', function () {
    gulp.src(['./jquery.validate.js', './jquery.validate.plus.js', './jquery.validate.define.js', './rules.js'])
        .pipe(concat('jquery.validate.build.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./'));
});