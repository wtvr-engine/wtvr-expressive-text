import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'wtvr-expressive-text.js',
  output: {
    dir: 'build',
    format: 'es'
  },
  plugins: [nodeResolve()]
};