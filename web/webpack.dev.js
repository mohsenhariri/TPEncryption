const fs = require('fs')
const {merge} = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
    hot: true,
    host: process.env.HOST,
    port: parseInt(process.env.PORT, 10),
    http2: process.env.SSL === 'true',
    https:
      process.env.SSL === 'true'
        ? {
            key: fs.readFileSync('./certs/key.pem'),
            cert: fs.readFileSync('./certs/cert.pem'),
          }
        : false,
    devMiddleware: {
      writeToDisk: process.env.writeToDisk === 'true',
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.dev.json',
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
})
