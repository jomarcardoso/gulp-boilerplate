module.exports = {
  mode: 'development',
  output: {
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.(png|jp(e*)g|svg)$/,  
        use: [{
          loader: 'url-loader',
        }]
      }
    ]
  }
}