module.exports = {
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true
  },
  globals: {
    chrome: true
  },
  plugins: ['html'],
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // add your custom rules here
  rules: {
    'semi': ['warn', 'always'],
    'space-before-function-paren': ['warn', 'always'],
    'object-curly-spacing': ['warn', 'always'],
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // no console
    'no-console': 2
  }
};
