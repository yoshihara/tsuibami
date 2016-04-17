gulp = require 'gulp'
del = require 'del'
plumber = require 'gulp-plumber'
notify = require 'gulp-notify'
runSequence = require 'run-sequence'

notifyError = ->
  plumber({errorHandler: notify.onError('<%= error.message %>')})

gulp.task 'watch', ->

gulp.task 'clean', (cb)->

gulp.task 'rebuild', -> runSequence('clean', 'build')

gulp.task 'default', -> runSequence('build')
