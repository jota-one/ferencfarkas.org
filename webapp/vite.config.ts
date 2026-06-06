import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig(({ mode }) => {
  const isDev = mode !== 'production';

  return {
    plugins: [
      svelte({
        compilerOptions: {
          dev: isDev,
        },
      }),
    ],
    build: {
      outDir: '../website/static/js',
      emptyOutDir: !isDev,
      rollupOptions: {
        input: 'src/main.js',
        output: {
          entryFileNames: 'catalogue.js',
          chunkFileNames: '[name].js',
          assetFileNames: 'catalogue.css',
          format: 'iife',
          name: 'app',
        },
      },
      minify: isDev ? false : 'esbuild',
      sourcemap: isDev ? 'inline' : true,
    },
  };
});