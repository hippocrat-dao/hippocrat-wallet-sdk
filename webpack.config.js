const { resolve } = require('path')
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
  entry: './lib/index.js',
  output: {
    filename: 'bundle.js',
    path: resolve('lib/browser/webpack')
  },
  plugins: [
    new NodePolyfillPlugin()
  ],
  experiments : {
   asyncWebAssembly: true
  },
  mode : 'development'
}