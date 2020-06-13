const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production', // NOTE: developmentだとoptions.htmlでのJS読み込みがCSPに引っかかってevalに失敗するのでproduction
  entry: {
    index: './src/js/index.js',
    options: './src/js/options.js'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].bundle.js'
  },
  plugins: [
    new webpack.ProvidePlugin({
      jQuery: 'jquery' // for jquery.esarea
    })
  ],
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  }
};
