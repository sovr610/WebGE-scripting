const path = require('path');

module.exports = {
  entry: './src/interpreter.js',
  output: {
    filename: 'serpent-interpreter.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'webgeScript',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /src\/.*\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  }
};

