// vite.config.js
import path, { dirname, resolve, extname, join } from 'path'
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import postcss from 'postcss';
import cssnano from 'cssnano';
import fs from 'fs';

function inlineFirstNonIndexCssHtmlString(s, outDir) {
  const LINK_RE_GLOBAL = /<link\b[^>]*\brel=["']stylesheet["'][^>]*>/ig
  const HREF_RE = /\bhref=["']([^"']+)["']/i

  // перебираем все вхождения link rel=stylesheet по порядку
  let match
  while ((match = LINK_RE_GLOBAL.exec(s)) !== null) {
    const linkTag = match[0]
    const hrefMatch = linkTag.match(HREF_RE)
    if (!hrefMatch) continue
    const hrefRaw = hrefMatch[1]
    const hrefNoQ = hrefRaw.split('?')[0].split('#')[0]
    const hrefBase = path.posix.basename(hrefNoQ)
    if (/index/i.test(hrefBase)) continue // пропускаем ссылки с "index" в basename

    // нашли нужный link — найдём файл CSS на диске
    const normalizeHref = (h) => h ? h.split('?')[0].split('#')[0].replace(/^\//, '') : ''
    const hrefNorm = normalizeHref(hrefRaw)
    const candidates = []
    if (hrefNorm) candidates.push(path.join(outDir, hrefNorm))
    candidates.push(path.join(outDir, hrefBase))
    candidates.push(path.join(outDir, 'assets', hrefBase))

    const short = hrefBase.replace(/\.[^/.]+$/, '')
    const findByBasenameContains = (dir) => {
      const walk = (d) => {
        const ents = fs.readdirSync(d, { withFileTypes: true })
        for (const e of ents) {
          const p = path.join(d, e.name)
          if (e.isDirectory()) {
            const found = walk(p)
            if (found) return found
          } else if (e.isFile()) {
            if (p.endsWith('.css') && path.posix.basename(p).includes(short)) return p
          }
        }
        return null
      }
      try { return walk(dir) } catch (e) { return null }
    }

    let cssPath = candidates.find(p => p && fs.existsSync(p))
    if (!cssPath) cssPath = findByBasenameContains(outDir)
    if (!cssPath) {
      // не нашли файл — продолжаем поиск следующего link
      continue
    }

    const cssSource = fs.readFileSync(cssPath, 'utf8')
    const styleTag = `<style data-critical>${cssSource.trim()}</style>`

    // заменяем именно это вхождение link (по позиции match.index и match[0].length)
    const before = s.slice(0, match.index)
    const after = s.slice(match.index + match[0].length)
    const newHtml = before + styleTag + after
    return newHtml
  }

  // если ничего не инлайнено — возвращаем исходный HTML
  return s
}

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

      // Удаление index.html (как было)
      const indexPattern = /(?<=["'(\s>])((?:\.\.\/|\.\.\\|\.\/|\.\\|\/)?(?:[^"'()\s>]+?)\/)?index\.html((?:\?[^\s"'()#>]*)?(?:#[^\s"'()>]*)?)(?=["'()\s>]|$)/ig;

      // Найти <link ... rel="stylesheet" ... href="...index-*.css[?....][#....]" ...>
      // Группа 3 содержит значение href (включая query/hash)
      // const stylesheetLinkPattern = /<link\b(?=[^>]*\brel\s*=\s*(['"]?)stylesheet\1)(?=[^>]*\bhref\s*=\s*(['"])([^'"]*index-[^'"]+\.css(?:\?[^\s"'()#>]*)?(?:#[^\s"'()>]*)?)\2)[^>]*>/ig;

      const linkPattern = /<link\b[^>]*\brel\s*=\s*(['"])stylesheet\1[^>]*>/ig;

      for (const file of htmlFiles) {
        let s = fs.readFileSync(file, 'utf8');

        // 1) Удаляем/заменяем index.html в ссылках
        s = s.replace(indexPattern, (match, prefix = '', queryHash = '') => {
          const preserved = queryHash || '';
          if (!prefix) return preserved;
          return prefix.replace(/\/$/, '') + preserved;
        });

        s = inlineFirstNonIndexCssHtmlString(s, outDir);

        // 2) Заменяем stylesheet link на preload-tag, сохраняя оригинальный href (group 3)
        s = s.replace(linkPattern, (fullMatch) => {
          // безопасно извлекаем href уже из найденного полного тега
          const hrefMatch = fullMatch.match(/\bhref\s*=\s*(['"])([^'"]+)\1/i)
          if (!hrefMatch) return fullMatch // ничего не трогаем, если href не нашли

          const hrefValue = hrefMatch[2]
          // построим корректный preload-тег; используйте одинарные/двойные кавычки консистентно
          return `<link rel="preload" href="${hrefValue}" as="style" onload="this.onload=null;this.rel='stylesheet'">`
        });

        fs.writeFileSync(file, s, 'utf8');
        this.info && this.info(`strip-index-html: updated ${file}`);
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
    cssCodeSplit: true,
  },
  plugins: [
    // inlineFirstStylesheetPlugin(),
    createHtmlPlugin({
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: false,
        removeScriptTypeAttributes: false,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: false,
      },
    }),
    stripIndexHtmlPlugin('dist'),
  ],
});
