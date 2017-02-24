var gulp = require('gulp');
var tsc = require('gulp-typescript');
var browserSync = require('browser-sync');
var execSync = require('child_process').execSync;

var tsProject = tsc.createProject('tsconfig.json');

gulp.task('typescript', function () {
    return gulp.src('./src/**/*.ts')
        .pipe(tsProject())
        .pipe(browserSync.reload({stream:true}));
});

gulp.task('emscripten', function () {
    execSync('make clean && make');
    browserSync.reload();
});

gulp.task('browser-sync', function() {
  browserSync.init(null, {
    server: {
      baseDir: "./"
    }
  });
});

gulp.task('watch', function() {
  gulp.watch('./src/**/*.ts', ['typescript']);
  gulp.watch(['./src/**/*.{cpp,h,hpp}', './shaders/**/*.frag'], ['emscripten']);
});

gulp.task('default', ['emscripten', 'typescript', 'browser-sync', 'watch']);
