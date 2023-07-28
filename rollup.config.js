import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
import html from '@web/rollup-plugin-html';
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';
import { terser } from 'rollup-plugin-terser';
import { generateSW } from 'rollup-plugin-workbox';
import path from 'path';

function iconPath(iconName) {
  return path.resolve(
    __dirname,
    `node_modules/@shoelace-style/shoelace/dist/assets/icons/${iconName}.svg`
  );
}

export default {
  input: 'index.html',
  output: {
    entryFileNames: '[name]-[hash].js',
    chunkFileNames: '[name]-[hash].js',
    assetFileNames: '[name]-[hash][extname]',
    format: 'es',
    dir: 'dist',
  },
  preserveEntrySignatures: false,

  plugins: [
    bundleWorkers(),
    /** Enable using HTML as rollup entrypoint */
    html({
      minify: true,
      injectServiceWorker: true,
      serviceWorkerPath: 'dist/sw.js',
    }),
    /** Resolve bare module imports */
    nodeResolve(),
    /** Minify JS */
    terser(),
    /** Bundle assets references via import.meta.url */
    importMetaAssets(),
    /** Copy required shoelace assets */
    copy({
      targets: [
        {
          src: [
            iconPath('x-lg'),
            iconPath('trash'),
            iconPath('globe2'),
            iconPath('download'),
            iconPath('play-fill'),
            iconPath('pause-fill'),
            iconPath('info-circle'),
            iconPath('check2-circle'),
            iconPath('three-dots-vertical'),
            iconPath('exclamation-triangle'),
            iconPath('exclamation-octagon'),
          ],
          dest: path.resolve(__dirname, 'dist/shoelace/assets/icons'),
        },
      ],
    }),
    /** Copy assets */
    copy({
      targets: [
        {
          src: path.resolve(
            __dirname,
            `assets`
          ),
          dest: path.resolve(__dirname, 'dist/'),
        },
      ],
    }),
    copy({
      targets: [{
        src: path.resolve(
          __dirname,
          'out-tsc/src/convolving/mid-side-to-stereo-converter.js'
        ), dest: path.resolve(__dirname, 'dist/')
      }]
    }),
    /** Compile JS to a lower language target */
    babel({
      babelHelpers: 'bundled',
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            targets: [
              'last 3 Chrome major versions',
              'last 3 Firefox major versions',
              'last 3 Edge major versions',
              'last 3 Safari major versions',
            ],
            modules: false,
            bugfixes: true,
          },
        ],
      ],
      plugins: [
        [
          require.resolve('babel-plugin-template-html-minifier'),
          {
            modules: { lit: ['html', { name: 'css', encapsulation: 'style' }] },
            failOnError: false,
            strictCSS: true,
            htmlMinifier: {
              collapseWhitespace: true,
              conservativeCollapse: true,
              removeComments: true,
              caseSensitive: true,
              minifyCSS: true,
            },
          },
        ],
      ],
    }),
    /** Create and inject a service worker */
    generateSW({
      globIgnores: ['polyfills/*.js', 'nomodule-*.js'],
      navigateFallback: '/index.html',
      // where to output the generated sw
      swDest: path.join('dist', 'sw.js'),
      // directory to match patterns against to be precached
      globDirectory: path.join('dist'),
      // cache any html js and css by default
      globPatterns: ['**/*.{html,js,css,webmanifest}'],
      skipWaiting: true,
      clientsClaim: true,
      runtimeCaching: [{ urlPattern: 'polyfills/*.js', handler: 'CacheFirst' }],
    }),
  ],
};

/**
 * Finds web worker creations like 
 * 
 *  new Worker(new URL('./path/to/worker.js', import.meta.url))
 *  new Worker(new URL("./path/to/worker.js", import.meta.url), { type: "module" })
 * 
 * and emits a web worker bundle file including a hash in its name.
*/
function bundleWorkers() {
  const WORKER_REGEX = /new\s+Worker\(\s*new\s+URL\(('.*?'|".*?")\s*,\s*import\.meta\.url\)/g;
  
  return {
    name: 'bundle-workers',
    /**
     * @param {string} code 
     * @param {string} id 
     */
    async transform(code, id) {
      const matches = code.matchAll(WORKER_REGEX);

      const workerFilesQuoted = [...matches]
        .map(([, workerPath]) => workerPath);

      if (workerFilesQuoted.length === 0) {
        return {
          code
        }
      }

      const uniqueWorkerFilesUnquoted = workerFilesQuoted
        .map(workerPath => workerPath.slice(1, -1)) // remove surrounding quotes
        .filter((workerPath, index, all) => all.indexOf(workerPath) === index); // only unique worker paths
     

      const resolvedFiles = await Promise.all(uniqueWorkerFilesUnquoted.map(workerPath => this.resolve(workerPath, id).then(resolved => ({
        workerPath,
        resolved
      }))));

      let output = code;
      for (const workerPathQuoted of workerFilesQuoted) {
        const workerPathUnquoted = workerPathQuoted.slice(1, -1);

        const resolvedFile = resolvedFiles.find(r => r.workerPath === workerPathUnquoted);
        if (!resolvedFile.resolved) {
          return this.error(`Cannot find script for web worker '${workerPathUnquoted}', defined in '${id}'`);
        }

        const chunkRefId = this.emitFile({
          id: resolvedFile.resolved.id,
          type: "chunk"
        });

        output = output.replaceAll(workerPathQuoted, `import.meta.ROLLUP_FILE_URL_${chunkRefId}`);
      }

      return {
        code: output
      }      
    }
  }
}
