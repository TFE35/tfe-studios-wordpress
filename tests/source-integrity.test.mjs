import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const theme='wp-content/themes/tfe-studios-motion/';
test('official emblem and navigation wordmark are unchanged from supplied reference',()=>{
  for(const [file,hash] of [
    ['TFE-Studios-Official-Logo.png','60ed94caf0cae88c7542f616a3d919fac08982dd20c0dadd2f11a92515589b95'],
    ['TFE-Studios-White-Header-Wordmark.png','ef851bb6d6097cd4710799ea387a32ed412ee184feb1cde2818e416bafc2cea4']
  ]) assert.equal(createHash('sha256').update(readFileSync(theme+'assets/'+file)).digest('hex'),hash);
});
test('shipped Three module is loadable locally and matches pinned API version',async()=>{
  const THREE=await import('../'+theme+'js/vendor/three.js');
  assert.equal(THREE.REVISION,'161');
  assert.equal(typeof THREE.WebGLRenderer,'function');
});
