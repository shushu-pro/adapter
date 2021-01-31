// .eslintrc.js
module.exports = {
  root: true,
  extends: ['@shushu.pro/base'],
  plugins: [],
  env: {
    node: true,
    browser: true,
    es6: true,
    jest: true,
  },
  rules: {
    // 忽略导入扩展名
    'import/extensions': [
      'error',
      'never',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
        css: 'ignorePackages',
      },
    ],
    'import/no-extraneous-dependencies': 'off',
    '@typescript-eslint/no-var-requires': 'off',
  },
  overrides: [],
  settings: {
    'import/resolver': {
      // alias: {
      //   map: [['@', './src']],
      //   extensions: ['.js', '.jsx', '.json '],
      // },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    react: {
      version: 'detect',
    },

    // 忽略导入类型错误提示
    'import/ignore': [/\.(scss|less|css)$/],
  },
};
