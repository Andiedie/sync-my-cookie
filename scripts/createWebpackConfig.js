const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

module.exports = (file) => {
  const parsed = path.parse(file);
  const name = parsed.name;
  const ext = parsed.ext;
  const entry = ['@babel/polyfill', file];
  const plugins = [new ProgressBarPlugin()];
  if (ext === '.tsx') {
    plugins.push(new HtmlWebpackPlugin({
      filename: `${name}.html`,
      inject: false,
      template: require('html-webpack-template'),
      appMountId: 'root',
      title: 'SyncMyCookie'
    }));
  }
  return {
    mode: 'production',
    entry,
    output: {
      filename: `${name}.js`,
      path: path.resolve(__dirname, '../build'),
    },
    resolve: {
      extensions: ['.ts', '.js', '.tsx']
    },
    module: {
      rules: [
        {test: /\.tsx?$/, loader: 'babel-loader'},
        {test: /\.tsx?$/, loader: 'awesome-typescript-loader'},
        {test: /\.js$/, loader: "source-map-loader", enforce: "pre"},
      ]
    },
    plugins,
  }
};
