// asignar las librerias en variables
var gulp = require('gulp')
var sass = require('gulp-sass')
var rename = require('gulp-rename')
var babel = require('babelify')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var watchify = require('watchify')


// tarea para compilar el css
gulp.task('styles', function() {
  gulp
  .src('index.scss')
  .pipe(sass())
  .pipe(rename('app.css'))
  .pipe(gulp.dest('public'))
})


// tarea para copiar el contenido de los assets
gulp.task('assets', function () {
  gulp
  .src('assets/*')
  .pipe(gulp.dest('public'))
})



// funcion para ejecutar la compilacion
function compile(watch) {
  // lo que nos refresa browserify pasarlo por watchify y almacenarlo en bundle
  var bundle = browserify('./src/index.js')

  // evaluar si queremos escuchar cambios en los archivos
  if(watch){
    bundle = watchify(bundle)
    bundle.on('update', function () {
      console.log('--> Bundling..')

      rebundle()
    })
  }

  // funcion para hacer la compilacion
  function rebundle(){
    bundle
    .transform(babel, { presets: [ 'es2015' ], plugins: [ 'syntax-async-functions', 'transform-regenerator'] })
    .bundle()
    .on('error', function (err) { console.log(err); this.emit('end')})
    .pipe(source('index.js'))
    .pipe(rename('app.js'))
    .pipe(gulp.dest('public'))
  }

  // ejecutar siempre una vez
  rebundle()
}



// tarea de compilacion
gulp.task('build', function (){
  return compile()
})

//tarea de watchify
gulp.task('watch', function (){
  return compile(true)
})



// ejecutar las tareas
gulp.task('default', ['styles', 'assets', 'build'])
