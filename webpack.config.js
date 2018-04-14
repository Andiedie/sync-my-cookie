const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

function resolve (dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  entry: {
    popup: resolve('src/popup/popup.js'),
    options: resolve('src/options/options.js'),
    background: resolve('src/background/background.js')
  },
  output: {
    path: resolve('dist'),
    filename: '[name].bundle.js'
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      '@': resolve('src')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src')],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'img/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[hash:7].[ext]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve('src/popup/popup.html'),
      chunks: ['popup'],
      filename: 'popup.html'
    }),
    new HtmlWebpackPlugin({
      template: resolve('src/options/options.html'),
      chunks: ['options'],
      filename: 'options.html'
    }),
    new CopyWebpackPlugin([
      { from: resolve('src/manifest.json') },
      { from: resolve('src/img'), to: 'img' }
    ])
  ]
};
