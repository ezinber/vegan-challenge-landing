// vite.config.js
import { dirname, resolve, extname, join } from 'path'
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import fs from 'fs';

function stripIndexHtmlPlugin(outDir = 'dist') {
  return {
    name: 'strip-index-html',
    closeBundle() {
      const walk = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        return entries.flatMap(entry => {
          const p = join(dir, entry.name);
          return entry.isDirectory() ? walk(p) : p;
        });
      };

      const htmlFiles = walk(outDir).filter(p => p.endsWith('.html'));

      // Паттерн теперь захватывает optional prefix (например /en/ или ./) и optional query/hash после index.html
      // Группы:
      // 1 - полный префикс (может быть undefined)
      // 2 - query/hash (например ?a=1 или #section или ?a=1#sec)
      const pattern = /(?<=["'(\s>])((?:\.\.\/|\.\.\\|\.\/|\.\\|\/)?(?:[^"'()\s>]+?)\/)?index\.html((?:\?[^\s"'()#>]*)?(?:#[^\s"'()>]*)?)(?=["'()\s>]|$)/ig;

      for (const file of htmlFiles) {
        let s = fs.readFileSync(file, 'utf8');
        const replaced = s.replace(pattern, (match, prefix = '', queryHash = '') => {
          // если префикса нет — оставляем пустую строку, но возвращаем query/hash (если есть)
          const preserved = queryHash || '';
          if (!prefix) {
            return preserved;
          }
          // убираем завершающий слэш у префикса и добавляем query/hash
          return prefix.replace(/\/$/, '') + preserved;
        });

        if (replaced !== s) {
          fs.writeFileSync(file, replaced, 'utf8');
          this.info && this.info(`strip-index-html: updated ${file}`);
        }
      }
    }
  };
}


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
        // analytics: resolve(__dirname, "en/analytics/index.html"),
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
        minifyCSS: false,
      },
    }),
    stripIndexHtmlPlugin('dist'),
  ],
});
