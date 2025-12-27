import fs from 'fs';
import { minify } from 'html-minifier-terser';

async function minifyFile(path){
  let s = fs.readFileSync(path,'utf8');
  s = await minify(s, { collapseWhitespace:true, removeComments:true, minifyCSS:true, minifyJS:false});
  fs.writeFileSync(path,s);
}

// запустите для собранного бандла или исходников
minifyFile('dist/assets/index.js');