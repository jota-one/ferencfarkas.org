import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig(({ mode }) => {
  const isDev = mode !== 'production';

  return {
    plugins: [
      svelte({
        compilerOptions: {
          // Important pour Svelte 5 : active les checks runtime en dev
          dev: isDev,
        },
      }),
    ],
    build: {
      // 1. Ciblez votre dossier externe
      outDir: '../website/static/js',

      // 2. Ne pas vider le dossier en mode dev (pour ne pas effacer d'autres fichiers)
      emptyOutDir: !isDev,

      // 3. Configuration fine de Rollup (moteur de build de Vite)
      rollupOptions: {
        input: 'src/main.js', // Votre point d'entrée
        output: {
          // Nom du fichier de sortie
          entryFileNames: 'catalogue.js',
          chunkFileNames: '[name].js',
          assetFileNames: 'catalogue.css', // Le CSS sera extrait ici grâce au plugin CSS de Vite par défaut

          // Format IIFE pour être utilisable comme une librairie globale (comme avant)
          format: 'iife',
          name: 'app', // Nom de la variable globale (ex: window.app)

          // Générer les sourcemaps
          sourcemap: true,
        },
      },

      // Minification seulement en prod
      minify: isDev ? false : 'esbuild',

      // En mode dev avec --watch, on veut des builds rapides
      sourcemap: isDev ? 'inline' : true,
    },
  };
});