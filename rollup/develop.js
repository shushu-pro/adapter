import { babel } from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import serve from 'rollup-plugin-serve'; // serve服务;
import livereload from 'rollup-plugin-livereload'; // 热更新;
import ENV from './env';
import external from './external';

const extensions = ['.js', '.ts'];

export default {
  input: './playground/index.ts', // 入口文件
  output: {
    // 出口文件
    file: './temp/index.bundle.js',
    format: 'iife',
    name: 'playground',
    sourcemap: true,
  },
  plugins: [
    nodeResolve({
      extensions,
      modulesOnly: true,
    }),
    babel({
      babelHelpers: 'bundled',
      presets: [
        [
          '@babel/preset-env',
          {
            useBuiltIns: 'entry', // or "usage"
            corejs: 3,
          },
        ],
        ['@babel/preset-typescript', {}],
      ],
      plugins: [
        // '@babel/plugin-proposal-class-properties',
      ],
      extensions,
      // exclude: 'node_modules/**', // 只编译源代码
      // runtimeHelpers: true,
    }),
    replace(ENV),
    serve({
      open: true,
      contentBase: ['./playground', './temp'], // 启动文件夹;
      host: 'localhost', // 设置服务器;
      port: 8000, // 端口号;
    }),
    livereload({
      watch: ['./playground/', './temp/'], // 监听文件夹
    }),
  ],
  external,
};
