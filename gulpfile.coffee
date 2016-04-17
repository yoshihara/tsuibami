gulp = require 'gulp'
del = require 'del'
plumber = require 'gulp-plumber'
notify = require 'gulp-notify'
runSequence = require 'run-sequence'

notifyError = ->
  plumber({errorHandler: notify.onError('<%= error.message %>')})

gulp.task 'default', -> runSequence('build')
