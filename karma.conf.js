module.exports = (isDebugMode) => {
  return {
    basePath: './',
    singleRun: !isDebugMode,
    frameworks: ['jspm', 'mocha', 'chai-sinon'],
    jspm: {
      loadFiles: ['test/**/*.+(js|jsx)'],
      serveFiles: ['src/**/*.+(js|jsx)']
    },
    keepAlive: true,
    babelPreprocessor: {
      options: {
        presets: ['stage-0', 'es2015', 'react']
      }
    },
    reporters: ['mocha'],
    preprocessors: {
      'src/**/*.+(js|jsx)': ['babel'],
      'test/**/*.+(js|jsx)': ['babel']
    },
    proxies: {
      '/static/img/': '/base/images/',
      '/src/': '/base/src/',
      '/test/': '/base/test/',
      '/jspm_packages/': '/base/jspm_packages/'
    },
    browsers: isDebugMode ? ['Chrome'] : ['PhantomJS'],
    files: [
      'node_modules/babel-polyfill/dist/polyfill.js'
    ]
  };
}
