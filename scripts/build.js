const path = require('path');
const p = path.resolve.bind(null, __dirname);
const fs = require('fs-extra');
const webpack = require('webpack');
const create = require('./createWebpackConfig');

console.log('Copy manifest.json');
fs.copySync(p('../manifest.json'), p('../build/manifest.json'));

console.log('Copy icons');
fs.copySync(p('../assets/icon'), p('../build/icon'));

console.log('Build extension');
webpack([
  create(p('../src/popup.tsx')),
  create(p('../src/options.tsx')),
  create(p('../src/background.ts')),
]).run();
