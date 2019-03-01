module.exports = {
  extends: 'airbnb-base',
  rules: {
    'no-console': 'off',
    'max-len': [
      'error',
      {
        'code': 200,
        'ignoreComments': true,
      }
    ],
    'implicit-arrow-linebreak': [
      'error', 'beside'
    ],
    'no-nested-ternary': 0
  },
  globals: {
    fetch: true,
  },
};
