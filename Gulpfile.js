var gulp = require('gulp');
var connect = require('gulp-connect');
var handlebars = require('gulp-compile-handlebars');
var rename = require("gulp-rename");
var sass = require('gulp-sass');
var exec = require('child_process').execSync;
var Builder = require('systemjs-builder');
var rev = require('gulp-rev');

gulp.task('default', ['serve']);

gulp.task('serve', ['render'],() => {
  connect.server({
    root: './dist',
    middleware(connect) {
      return [
        connect().use('/static', connect.static('./dist/static')),
        connect().use('/config.js', connect.static('config.js')),
        connect().use('/jspm_packages', connect.static('jspm_packages')),
        connect().use('/index.js', connect.static('./src/index.js'))
      ];
    }
  });
});

gulp.task('render', ['clean', 'sass'], () => {
  return gulp.src('src/index.hbs')
    .pipe(handlebars())
    .pipe(rename('index.html'))
    .pipe(gulp.dest(`dist`));
});

gulp.task('sass', () => {
  return gulp.src('src/styles/app.scss')
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(gulp.dest('dist/static/css'));
});

gulp.task('clean', function () {
  return exec('rm -rf ./dist');
});

gulp.task('build', () => {
  const buildPath = './dist/static/js';

  return new Promise(resolve => {
    var builder = new Builder({
      baseURL: './'
    });
    return builder.loadConfig('config.js')
      .then(() => {
        return builder.buildStatic('./src/index.js', `${buildPath}/app.js`, {
          minify: true,
          sourceMaps: false,
          runtime: false
        });
      }).then(() => {
        return gulp.src(`${buildPath}/app.js`)
          .pipe(rev())
          .pipe(gulp.dest(buildPath))
          .on('end', () => {
            exec(`rm ${buildPath}/app.js`);
            resolve();
          });
      });
  });
});