const HtmlWebpackPlugin = require('html-webpack-plugin'); // installed via npm
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
  entry: {
    index: "./src/app.js",
  },
  output: {
    filename: "[name].js"
  },
  watch: true,
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-proposal-object-rest-spread']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: (resourcePath, context) => `${path.relative(path.dirname(resourcePath), context)}/`
              ,
            },
          },
          'css-loader',
        ],
      },
    ]
  },
  plugins: [

    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './index.html',
      chunks: ['index'],
    }),

    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      moduleFilename: ({ name }) => {
        switch (name) {
          default:
            return '[name].css';
        }
      },
    }),
  ],

};

