const path = require('path')
const MockServerWebpackPlugin = require('../dist/cjs')

const TEST_PATH = path.join(process.cwd(), 'test')

module.exports = {
  entry: path.resolve(TEST_PATH, 'js/index.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(TEST_PATH, 'dist'),
  },
  watch: true,
  plugins: [
    new MockServerWebpackPlugin({
      openApi: 'http://127.0.0.1:4000/file/default_OpenAPI.json',
    }),
  ],
}
