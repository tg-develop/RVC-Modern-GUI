const { merge } = require('webpack-merge');
const common = require('./webpack_web.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  
  devServer: {
    static: {
      directory: './public',
    },
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
    compress: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
  
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        vendor: {
          name: 'vendor',
          chunks: 'all',
          test: /node_modules/,
        },
      },
    },
  },
  
  stats: {
    errorDetails: true,
    children: true,
  },
  
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
});