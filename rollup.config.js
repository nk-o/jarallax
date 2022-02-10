import path from 'path';

import { babel } from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import browsersync from 'rollup-plugin-browsersync';

const { data } = require('json-file').read('./package.json');

const year = new Date().getFullYear();

function getHeader() {
  return `/*!
 * Jarallax v${data.version} (${data.homepage})
 * Copyright ${year} ${data.author}
 * Licensed under MIT (https://github.com/nk-o/jarallax/blob/master/LICENSE)
 */`;
}

function getVideoHeader() {
  return `/*!
 * Video Extension for Jarallax v${data.version} (${data.homepage})
 * Copyright ${year} ${data.author}
 * Licensed under MIT (https://github.com/nk-o/jarallax/blob/master/LICENSE)
 */
`;
}

function getElementHeader() {
  return `/*!
 * DEPRECATED Elements Extension for Jarallax. Use lax.js instead https://github.com/alexfoxy/lax.js
 */
`;
}

const pathCore = path.join(__dirname, 'src/core.esm.js');
const pathCoreUmd = path.join(__dirname, 'src/core.umd.js');
const pathExtVideoUmd = path.join(__dirname, 'src/ext-video.umd.js');
const pathExtElementUmd = path.join(__dirname, 'src/deprecated/ext-element.umd.js');

const bundles = [
  // Core.
  {
    input: pathCore,
    output: {
      banner: getHeader(),
      file: path.join(__dirname, 'dist/jarallax.esm.js'),
      format: 'esm',
    },
  },
  {
    input: pathCore,
    output: {
      banner: getHeader(),
      file: path.join(__dirname, 'dist/jarallax.esm.min.js'),
      format: 'esm',
    },
  },
  {
    input: pathCoreUmd,
    output: {
      banner: getHeader(),
      name: 'jarallax',
      file: path.join(__dirname, 'dist/jarallax.js'),
      format: 'umd',
    },
  },
  {
    input: pathCoreUmd,
    output: {
      banner: getHeader(),
      name: 'jarallax',
      file: path.join(__dirname, 'dist/jarallax.min.js'),
      format: 'umd',
    },
  },
  {
    input: pathCore,
    output: {
      banner: getHeader(),
      file: path.join(__dirname, 'dist/jarallax.cjs'),
      format: 'cjs',
    },
  },

  // Video Extension.
  {
    input: pathExtVideoUmd,
    output: {
      banner: getVideoHeader(),
      name: 'jarallaxVideo',
      file: path.join(__dirname, 'dist/jarallax-video.js'),
      format: 'umd',
    },
  },
  {
    input: pathExtVideoUmd,
    output: {
      banner: getVideoHeader(),
      name: 'jarallaxVideo',
      file: path.join(__dirname, 'dist/jarallax-video.min.js'),
      format: 'umd',
    },
  },

  // Element Extension.
  {
    input: pathExtElementUmd,
    output: {
      banner: getElementHeader(),
      name: 'jarallaxElement',
      file: path.join(__dirname, 'dist/jarallax-element.js'),
      format: 'umd',
    },
  },
  {
    input: pathExtElementUmd,
    output: {
      banner: getElementHeader(),
      name: 'jarallaxElement',
      file: path.join(__dirname, 'dist/jarallax-element.min.js'),
      format: 'umd',
    },
  },
];

const isDev = () => process.env.NODE_ENV === 'dev';
const isUMD = (file) => file.includes('jarallax.js') || file.includes('jarallax-video.js');
const isMinEnv = (file) => file.includes('.min.');
const isSpecificEnv = (file) => isMinEnv(file);
const isDebugAlways = (file) => (isDev() || isUMD(file) ? 'true' : 'false');

const configs = bundles.map(({ input: inputPath, output }) => ({
  input: inputPath,
  output,
  plugins: [
    nodeResolve(),
    babel({
      babelHelpers: 'bundled',
      plugins: ['annotate-pure-calls'],
    }),
    replace({
      __DEV__: isSpecificEnv(output.file)
        ? isDebugAlways(output.file)
        : 'process.env.NODE_ENV !== "production"',
      preventAssignment: true,
    }),
    output.file.includes('.min.') && terser(),
  ],
}));

// Copy CSS file to dist.
configs[0].plugins.unshift(
  copy({
    targets: [{ src: 'src/core.css', dest: 'dist', rename: () => 'jarallax.css' }],
  })
);

// Dev server.
if (isDev()) {
  configs[configs.length - 1].plugins.push(
    browsersync({
      server: {
        baseDir: ['demo', './'],
      },
    })
  );
}

export default configs;
