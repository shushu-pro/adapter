import { babel } from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
// import buble from '@rollup/plugin-buble';
// import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
// import node from 'rollup-plugin-node-builtins';
// import nodeGlobals from 'rollup-plugin-node-globals';
import replace from '@rollup/plugin-replace';
import ENV from './env';
import external from './external';

const extensions = ['.js', '.ts'];

export default {
  input: './src/index.ts', // 入口文件
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true,
    },
    // {
    //   file: 'dist/index.umd.js',
    //   format: 'umd',
    //   name: 'mylib',
    //   sourcemap: true,
    // },
  ],
  plugins: [
    replace(ENV),
    commonjs(),
    nodeResolve({
      extensions,
      // 将自定义选项传递给解析插件
      customResolveOptions: {
        moduleDirectories: ['node_modules'],
      },
    }),
    babel({
      babelHelpers: 'bundled',
      presets: [
        [
          '@babel/preset-env',
          {
            useBuiltIns: false,
            // useBuiltIns: 'entry', // "usage" or "entry" or false
            // corejs: 3,
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

    // json(),
    // buble({
    //   objectAssign: 'Object.assign',
    //   transforms: {
    //     // asyncAwait: false
    //   },
    // }),

    // node(),
    // nodeGlobals(),
    terser(),
  ],
  external,
};
