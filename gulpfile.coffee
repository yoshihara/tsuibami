gulp = require 'gulp'
del = require 'del'
haml = require 'gulp-ruby-haml'
sass = require 'gulp-sass'
runSequence = require 'run-sequence'

paths =
  lib: 'lib/**/*.*'
  js: 'src/js/**/*.*'
  haml: 'src/haml/**/*.haml'
  sass: 'src/sass/**/*.*'
  metadata: 'metadata/**/*.*'

gulp.task 'js', ->
  gulp.src(paths.js)
    .pipe(gulp.dest('build/'))

gulp.task 'haml', ->
  gulp.src(paths.haml)
    .pipe(haml())
    .pipe(gulp.dest('build/'))

gulp.task 'sass', ->
  gulp.src(paths.sass)
    .pipe(sass())
    .pipe(gulp.dest("build/"))

gulp.task 'copyLib', ->
  gulp.src(paths.lib)
    .pipe(gulp.dest('build/lib'))

gulp.task 'copyMetadata', ->
  gulp.src(paths.metadata)
    .pipe(gulp.dest('build/'))

gulp.task 'watch', ->
  for task in ['js', 'haml', 'sass'] then gulp.watch paths[task], [task]
  gulp.watch paths.lib, ['copyLib']
  gulp.watch paths.metadata, ['copyMetadata']

gulp.task 'clean', (cb)->
  del(['build', 'build.zip'], cb);

gulp.task 'build', -> runSequence('haml', 'js', 'sass', 'copyLib', 'copyMetadata')
gulp.task 'rebuild', -> runSequence('clean', 'build')

gulp.task 'default', -> runSequence('build')
