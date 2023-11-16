import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
/*
  Using react-app-rewired, this file allows you to modify the default webpack configuration that react-scripts produces
  internally, which are normally not exposed for modification.

  https://www.npmjs.com/package/react-app-rewired
*/

// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpack = require('webpack');

module.exports = {
  webpack: function (config, env) {
    config.resolve.fallback = {
      assert: require.resolve('assert'),
      constants: require.resolve('fs-constants'),
      fs: require.resolve('fs-extra'),
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify')
    };

    config.plugins = (config.plugins || []).concat([
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer']
      }),
      new ForkTsCheckerWebpackPlugin({ typescript: { memoryLimit: 8192 } })
    ]);

    // Hide sourcemap (development) warnings in app console log
    config.ignoreWarnings = [/Failed to parse source map/, /autoprefixer/];

    return config;
  }
};
