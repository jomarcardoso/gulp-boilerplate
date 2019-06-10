
const webpack = require('webpack');
const { API = 'http://localhost:8080' } = process.env;

module.exports = {
  output: {
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/env',
              '@babel/preset-flow',
              '@babel/preset-typescript'
            ]
          }
        }
      },
      {
        test: /\.(png|jp(e*)g|svg)$/,
        use: [{
          loader: 'url-loader',
        }]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      __API__: `"${API}"`
    })
  ]
};
