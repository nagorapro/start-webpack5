const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const HtmlMinimizerPlugin = require('html-minimizer-webpack-plugin')
const CssMinWebpackPlugin = require('css-minimizer-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const BSyncWebpackPlugin = require('browser-sync-webpack-plugin')

const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd

console.log('IS_PROD:', isProd)
console.log('IS_DEV:', isDev)

const filename = (filename, ext) => isDev
  ? `${filename}.${ext}`
  : `${filename}.[hash].min.${ext}`

const jsLoaders = () => {
  const loaders = [
    {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env'],
      }
    }
  ]
  if (isDev) {loaders.push('eslint-loader')}
  return loaders
}

const optimization = () => {
  if (isProd) {
    return {
      minimize: true,
      minimizer: [
        new HtmlMinimizerPlugin(),
        new CssMinWebpackPlugin(),
        new TerserWebpackPlugin({
          terserOptions: {
            format: {
              comments: false
            }
          },
          extractComments: false
        })
      ]
    }
  }
}

const сonfig = {
  context: path.resolve(__dirname, 'src'),
  mode: 'development',
  devtool: isDev ? 'source-map' : false,
  optimization: optimization(),

  entry: [
    '@babel/polyfill',
    './js/main.js'
  ],

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `js/${filename('bundle', 'js')}`
  },

  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
    port: 8080,
    open: true,
    hot: true,
    compress: true
  },

  resolve: {
    extensions: ['.js'],
    alias: {
      '@': path.resolve(__dirname, 'src/js'),
    }
  },

  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        sideEffects: true,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ],
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: jsLoaders(),
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
        type: 'asset/inline',
      }
    ]
  },

  plugins: [
    new BSyncWebpackPlugin({
      port: 3000,
      host: 'localhost',
      proxy: 'http://localhost:8080/'
    }),
    new MiniCssExtractPlugin({
      filename: `css/${filename('style', 'css')}`,
    }),
    new HTMLWebpackPlugin({
      template: 'index.html'
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/assets'),
          to: path.resolve(__dirname, 'dist/assets')
        }
      ]
    }),
    new CleanWebpackPlugin()
  ]
}

module.exports = сonfig