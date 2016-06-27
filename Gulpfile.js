'use strict';
/************************************
 * Configure build directory structure
 ************************************/

const buildDir        = './dist';
const staticAssetsDir = `${buildDir}/static`;
const cssDir          = `${staticAssetsDir}/css`;
const jsDir           = `${staticAssetsDir}/js`;
const imgDir          = `${staticAssetsDir}/img`;
const fontsDir        = `${staticAssetsDir}/fonts`;
const devServerPort   = 8080;

/************************************
 * Require Libs
 ************************************/

const gulp             = require('gulp');
const connect          = require('gulp-connect');
const proxyMiddleware  = require('http-proxy-middleware');
const handlebars       = require('gulp-compile-handlebars');
const rename           = require("gulp-rename");
const sass             = require('gulp-sass');
const sassJspm         = require('sass-jspm-importer');
const exec             = require('child_process').execSync;
const Builder          = require('systemjs-builder');
const rev              = require('gulp-rev');
const readdirSync      = require('fs').readdirSync;
const argv             = require('yargs').argv;
const path             = require('path');
const KarmaServer      = require('karma').Server;
const karmaConfig      = require('./karma.conf.js');

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
    console.log('gulp test            runs your tests using Phantomjs');
    console.log('gulp test --debug    runs your tests using Chrome');
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

gulp.task('test',  () => {
  new KarmaServer(karmaConfig(argv.debug)).start();
});

/************************************
 * Build Functions
 ************************************/

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
    promises.push(compileJs()
        .then(copyImages)
        .then(copyFonts));
  }
  return Promise.all(promises);
}

function compileSass() {
  return new Promise(resolve => {
    const stream = gulp.src('src/styles/app.scss')
      .pipe(sass({
        errLogToConsole: true,
        outputStyle: 'compressed',
        importer: sassJspm.importer
      }));

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
        gulp.src(`${jsDir}/app.js`)
          .pipe(rev())
          .pipe(gulp.dest(jsDir))
          .on('end', () => {
            exec(`rm ${jsDir}/app.js`);
            resolve();
          });
      });
  });
}

function copyImages() {
  return new Promise(resolve => {
    gulp.src('./img/**/*')
      .pipe(gulp.dest(imgDir))
      .on('end', resolve);
  });
}

function copyFonts() {
  return new Promise(resolve => {
    gulp.src('./fonts/**/*')
      .pipe(gulp.dest(fontsDir))
      .on('end', resolve);
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
        isProdBuild
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

  /**
   * Add your api endpoints here so your development server
   * knows to make the requests to the api server instead of
   * responding with index.html
   */
  const apiProxy = () => {
    return proxyMiddleware([
      '/api/v1/**/*',
      '/some/other/endpoint/**/*'], {target: 'http://your-api-url'});
  };

  const opts = {
    root: `./${buildDir}`,
    fallback: `./${buildDir}/index.html`,
    port: devServerPort,
    middleware(connect) {
      return [
        connect().use('/index.js',      connect.static('./src/index.js')),
        connect().use('/config.js',     connect.static('./config.js')),
        connect().use('/jspm_packages', connect.static('./jspm_packages')),
        connect().use('/static/img',    connect.static('./img')),
        connect().use('/static/fonts',  connect.static('./fonts')),
        connect().use('/src',           connect.static('./src')),
        connect().use(apiProxy())
      ];
    }
  };

  if(!isProdBuild) {
    Object.assign(opts, { livereload: true });
  }

  connect.server(opts);
}

function watch() {
  const cssBuildPath = `${buildDir}/**/*.css`;
  gulp.watch('./src/styles/**/*.scss', compileSass);
  gulp.watch(cssBuildPath, () => {
    gulp.src(cssBuildPath).pipe(connect.reload());
  });

  gulp.watch([
    './src/**/*',
    './src/**/*.jsx',
    './img/**/*',
    './fonts/**/*'
  ], () => {
    gulp.src('./src/index.js')
      .pipe(connect.reload());
  });
}