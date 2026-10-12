import { build } from 'esbuild';
import { mkdirSync, copyFileSync } from 'node:fs';
const out = 'wp-content/themes/tfe-studios-motion/js/vendor';
mkdirSync(out, { recursive: true });
await build({entryPoints:['node_modules/three/build/three.module.js'],outfile:out+'/three.js',bundle:true,format:'esm',minify:true,target:'es2020',legalComments:'eof'});
copyFileSync('node_modules/three/LICENSE', out+'/THREE-LICENSE.txt');
console.log('Built local Three.js 0.161.0');
