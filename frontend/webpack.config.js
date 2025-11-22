const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  entry: path.resolve(__dirname, './src/main.tsx'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isProd ? 'bundle.[contenthash].js' : 'bundle.js',
    publicPath: '/',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: [isProd ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader'],
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html'),
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: path.resolve(__dirname, 'public'), to: '.' }],
    }),
    new MiniCssExtractPlugin({ filename: isProd ? '[name].[contenthash].css' : '[name].css' }),
  ],
  devtool: isProd ? 'source-map' : 'eval-source-map',
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'public'),
    },
    historyApiFallback: true,
    hot: true,
    compress: true,
    port: 3000,
  },
};
