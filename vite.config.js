// vite.config.js
import { dirname, resolve, extname, join } from 'path'
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import fs from 'fs';

function stripIndexHtmlPlugin(outDir = 'dist') {
  return {
    name: 'strip-index-html',
    closeBundle() {
      const walk = (dir, cb) => {
        for (const name of fs.readdirSync(dir)) {
          const p = join(dir, name);
          if (fs.statSync(p).isDirectory()) walk(p, cb);
          else cb(p);
        }
      };

      const htmlFiles = [];
      walk(outDir, (p) => { if (p.endsWith('.html')) htmlFiles.push(p); });

      const indexPattern = /(^|["'()>\s])\/?(([a-z0-9\-._~%!$&'()*+,;=:@\/]+)\/)index\.html(?=["'()>\s]|$)/ig;

      for (const file of htmlFiles) {
        let s = fs.readFileSync(file, 'utf8');
        const replaced = s.replace(indexPattern, (m, prefix, pathPart) => {
          // если pathPart пустой — это /index.html -> заменяем на '/'
          const clean = pathPart ? `/${pathPart.replace(/\/$/,'')}` : '/';
          return prefix + clean;
        });
        if (replaced !== s) {
          fs.writeFileSync(file, replaced, 'utf8');
          this.info(`strip-index-html: updated ${file}`);
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
    stripIndexHtmlPlugin('dist'),
  ],
});
