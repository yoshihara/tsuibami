const path = require('path');
const webpack = require('webpack');

module.exports = {
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
  ]
};
