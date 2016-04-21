'use strict'
/************************************
 * Configure build directory structure
 ************************************/

const buildDir        = './dist';
const staticAssetsDir = `${buildDir}/static`;
const cssDir          = `${staticAssetsDir}/css`;
const jsDir           = `${staticAssetsDir}/js`;

/************************************
 * Require Libs
 ************************************/

const gulp        = require('gulp');
const connect     = require('gulp-connect');
const handlebars  = require('gulp-compile-handlebars');
const rename      = require("gulp-rename");
const sass        = require('gulp-sass');
const exec        = require('child_process').execSync;
const Builder     = require('systemjs-builder');
const rev         = require('gulp-rev');
const readdirSync = require('fs').readdirSync;
const argv        = require('yargs').argv;
const path        = require('path');

/************************************
 * Build Tasks
 ************************************/

let isProdBuild = false;

gulp.task('default', ['logTasks']);
gulp.task('logTasks', () => {
  process.nextTick(() => {
    console.log();
    console.log('gulp serve           serves your app locally');
    console.log('gulp serve --prod    serves the production build of your app locally');
    console.log('gulp build           bundles your app for production');
    console.log('gulp test            runs your tests');
    console.log();
  });
});

gulp.task('serve', () => {
  isProdBuild = argv.prod;
  clean()
    .then(compileAssets)
    .then(render)
    .then(startServer)
    .then(watch);
});

gulp.task('build', () => {
  isProdBuild = true;
  clean()
    .then(compileAssets)
    .then(render);
});

gulp.task('test',  () => {});

function clean() {
  return new Promise(resolve => {
    exec(`rm -rf ${buildDir}`);
    resolve();
  });
}

function compileAssets() {
  const promises = [];
  promises.push(compileSass());
  if(isProdBuild) {
    promises.push(compileJs());
  }
  return Promise.all(promises);
}

function compileSass() {
  return new Promise(resolve => {
    const stream = gulp.src('src/styles/app.scss')
    .pipe(sass({outputStyle: 'compressed'}));

    if(isProdBuild) {
     stream.pipe(rev());
    }

    stream.pipe(gulp.dest(cssDir))
    .on('end', resolve);
  });
}

function compileJs() {
  return new Promise(resolve => {
    var builder = new Builder({
      baseURL: './'
    });

    return builder.loadConfig('config.js')
      .then(() => {
        return builder.buildStatic('./src/index.js', `${jsDir}/app.js`, {
          minify: true,
          sourceMaps: false,
          runtime: false
        });
      }).then(() => {
        return gulp.src(`${jsDir}/app.js`)
          .pipe(rev())
          .pipe(gulp.dest(jsDir))
          .on('end', () => {
            exec(`rm ${jsDir}/app.js`);
            resolve();
          });
      });
  });
}

function render() {
  return new Promise(resolve => {
    const data = {
      appCss: readdirSync(cssDir)[0]
    };

    if (isProdBuild) {
      Object.assign(data, {
        appJs: readdirSync(jsDir)[0],
        isProd: true
      });
    }

    gulp.src('src/index.hbs')
      .pipe(handlebars(data))
      .pipe(rename('index.html'))
      .pipe(gulp.dest(buildDir))
      .on('end', resolve);
  });
}

function startServer() {
  const opts = {
    root: './dist',
    middleware(connect) {
      return [
        connect().use('/static',        connect.static('./dist/static')),
        connect().use('/config.js',     connect.static('config.js')),
        connect().use('/jspm_packages', connect.static('jspm_packages')),
        connect().use('/index.js',      connect.static('./src/index.js'))
      ];
    }
  };

  if(!isProdBuild) {
    Object.assign(opts, { livereload: true });
  }

  connect.server(opts);
}

function watch() {
  gulp.watch('./src/styles/**/*.scss', () => {
    compileSass()
      .then(() => {
        gulp.src(`${buildDir}/**/*.css`)
          .pipe(connect.reload());
      });
  });

  gulp.watch('./src/**/*', () => {
    gulp.src('./src/index.js')
      .pipe(connect.reload());
  });
}