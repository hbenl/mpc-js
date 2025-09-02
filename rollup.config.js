import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

export default [{
  input: 'out/node/index.js',
  output: [{
    file: 'dist/node/mpc.mjs',
    format: 'esm',
    sourcemap: true,
    sourcemapExcludeSources: true
  }, {
    file: 'dist/node/mpc.cjs',
    format: 'cjs',
    sourcemap: true,
    sourcemapExcludeSources: true
  }],
  external: [ 'net', 'eventemitter3' ],
  plugins: [ sourcemaps() ]
}, {
  input: 'out/node/index.d.ts',
  output: { file: 'dist/node/mpc.d.ts' },
  plugins: [ dts() ]
}, {
  input: 'out/browser/index.js',
  output: [{
    file: 'dist/browser/mpc.mjs',
    format: 'esm',
    sourcemap: true,
    sourcemapExcludeSources: true
  }, {
    file: 'dist/browser/mpc.cjs',
    format: 'cjs',
    sourcemap: true,
    sourcemapExcludeSources: true
  }],
  external: [ 'eventemitter3' ],
  plugins: [ sourcemaps() ]
}, {
  input: 'out/browser/index.d.ts',
  output: { file: 'dist/browser/mpc.d.ts' },
  plugins: [ dts() ]
}, {
  input: 'out/browser/index.js',
  output: [{
    file: 'dist/browser/mpc.min.mjs',
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
  input: 'out/browser/index.default.js',
  output: [{
    file: 'dist/browser/mpc.umd.min.js',
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
