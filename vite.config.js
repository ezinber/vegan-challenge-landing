// vite.config.js
import { dirname, resolve } from 'path'
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
  build: {
    appType: 'mpa',
    // root: 'src',
    outDir: 'dist', // Каталог для сборки
    emptyOutDir: true,
    assetsDir: 'assets', // Каталог для статических ресурсов
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        en: resolve(__dirname, "en/index.html"),
        mealPlan: resolve(__dirname, "en/meal-plan/index.html"),
        dietaryGuides: resolve(__dirname, "en/dietary-guides/index.html"),
        analytics: resolve(__dirname, "en/analytics/index.html"),
      },
    },
  },
  plugins: [
    createHtmlPlugin({
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
      },
    }),
  ],
});