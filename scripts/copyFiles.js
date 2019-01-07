const path = require('path');
const p = path.resolve.bind(null, __dirname);
const fs = require('fs-extra');

console.log('Copy manifest.json');
fs.copySync(p('../manifest.json'), p('../build/manifest.json'));

console.log('Copy icons');
fs.copySync(p('../assets/icon'), p('../build/icon'));