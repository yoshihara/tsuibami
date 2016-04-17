gulp = require 'gulp'
del = require 'del'
sass = require 'gulp-sass'
plumber = require 'gulp-plumber'
notify = require 'gulp-notify'
runSequence = require 'run-sequence'

notifyError = ->
  plumber({errorHandler: notify.onError('<%= error.message %>')})

paths =
  sass: 'src/sass/**/*.*'

gulp.task 'sass', ->
  gulp.src(paths.sass)
    .pipe(notifyError())
    .pipe(sass())
    .pipe(gulp.dest("build/"))

gulp.task 'watch', ->
  for task in ['sass'] then gulp.watch paths[task], [task]

gulp.task 'clean', (cb)->
  del(['build', 'build.zip'], cb);

gulp.task 'build', -> runSequence('sass')
gulp.task 'rebuild', -> runSequence('clean', 'build')

gulp.task 'default', -> runSequence('build')
