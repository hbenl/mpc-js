import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

export default [{
  input: ['out/mpc.js', 'out/mpc-node.js'],
  output: [{
    dir: 'dist',
    format: 'esm',
    entryFileNames: '[name].mjs',
    sourcemap: true,
    sourcemapExcludeSources: true
  }, {
    dir: 'dist',
    format: 'cjs',
    entryFileNames: '[name].cjs',
    sourcemap: true,
    sourcemapExcludeSources: true
  }],
  external: [ 'net', 'eventemitter3' ],
  plugins: [ sourcemaps() ]
}, {
  input: 'out/mpc.js',
  output: { file: 'dist/mpc.d.ts' },
  plugins: [ dts() ]
}, {
  input: 'out/mpc-node.js',
  output: { file: 'dist/mpc-node.d.ts' },
  plugins: [ dts() ]
}, {
  input: 'out/mpc.js',
  output: [{
    file: 'dist/mpc.min.mjs',
    format: 'esm',
    sourcemap: true
  }],
  plugins: [
    nodeResolve(),
    commonjs(),
    sourcemaps(),
    terser(),
  ]
}, {
  input: 'out/mpc.default.js',
  output: [{
    file: 'dist/mpc.umd.min.js',
    format: 'umd',
    name: 'MPC',
    sourcemap: true
  }],
  plugins: [
    nodeResolve(),
    commonjs(),
    sourcemaps(),
    terser(),
  ]
}];
