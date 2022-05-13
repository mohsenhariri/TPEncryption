const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const {GenerateSW} = require('workbox-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    // clean: true,
    assetModuleFilename: 'images/[hash][ext][query]',
  },
  resolve: {
    extensions: ['.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/assets/template.html',
      favicon: './src/assets/favicon.ico',
      title: 'title',
      manifest: 'manifest.json',
      meta: {
        'viewport': 'width=device-width, initial-scale=1, shrink-to-fit=no',
        'theme-color': '#4285f4',
      },
      link: {
        manifest: 'manifest.json',
      },
    }),
    // new GenerateSW({
    //   clientsClaim: true,
    //   skipWaiting: true,
    // }),
    // new webpack.DefinePlugin({
    //   'process.browser': 'true',
    // }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
}
