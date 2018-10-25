const path    = require('path')
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './lib/bundle.js',
  output: {
    filename: 'superp00t-etc.min.js',
    path:     path.resolve(__dirname, 'dist')
  },

  target: "web",

  plugins: [
    new webpack.DefinePlugin({
      __DEV__: false,
      __PROD__: true,
      'process.env':{
        'NODE_ENV': JSON.stringify('production')
      },
    })
  ]
}