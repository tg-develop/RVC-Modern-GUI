const { merge } = require('webpack-merge');
const common = require('./webpack_web.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Override CSS rule for production
const prodCommon = {
  ...common,
  module: {
    ...common.module,
    rules: common.module.rules.map(rule => {
      if (rule.test && rule.test.toString().includes('css')) {
        return {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
          ],
        };
      }
      return rule;
    }),
  },
};

module.exports = merge(prodCommon, {
  mode: 'production',
  devtool: 'source-map',
  
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 30,
      maxAsyncRequests: 30,
      cacheGroups: {
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10,
          chunks: 'all',
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          priority: 20,
          chunks: 'all',
        },
        fontawesome: {
          test: /[\\/]node_modules[\\/]@fortawesome[\\/]/,
          name: 'fontawesome',
          priority: 15,
          chunks: 'all',
        },
      },
    },
    runtimeChunk: {
      name: 'runtime',
    },
  },
  
  plugins: [
    ...common.plugins,
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash].css',
      chunkFilename: 'static/css/[name].[contenthash].chunk.css',
    }),
  ],
  
  performance: {
    hints: 'warning',
    maxEntrypointSize: 500000,
    maxAssetSize: 500000,
  },
  
  stats: {
    children: false,
    chunks: false,
    modules: false,
    colors: true,
    warnings: true,
    errors: true,
    errorDetails: true,
  },
});