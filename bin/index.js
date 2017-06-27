#!/usr/bin/env node

const prompt = require('co-prompt');
const program = require('commander');
const archLog = require('../lib/archLog');
const pkg = require('../package.json');
const generator = require('./generator');

// let c = (y, w, h) => w / 2 * Math.sqrt(1 - y * y / ( h * h )) + 0.5 | 0;
// let r = 22, p = r / 2, q = p / 5, s = '';
//
// for (let y = -p; ++y < p;) {
//   for (let x = -r; ++x < r;) {
//     let d = c(y, r * 2, p),
//         e = c(y + q, r / 5, q),
//         f = e - p,
//         g = e + p,
//         h = c(y, r * 1.3, r / 3);
//     s += (x >= d || x <= -d || (x > -g && x < f) || (x < g && x > -f) || (y > q && (x > -h && x < h))) ? ' ' : 0;
//   }
//   s += '\n';
// }
//
// console.log(s);

archLog.info(`Welcome, to HAPI ARCH version ${pkg.version}`);

program
    .version(pkg.version)
    .command('generate <mode>')
    .description('hapi-arch generator command')
    .action((mode) => generator(mode));

program.parse(process.argv);