module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: {
          node: '18.20.4',
        },
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    'babel-plugin-add-module-exports',
    [
      'module-resolver',
      {
        alias: {
          '@': './src',
        },
      },
    ],
  ],
}
