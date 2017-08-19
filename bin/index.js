#!/usr/bin/env node

const program = require('commander');
const archLog = require('../lib/archLog');
const pkg = require('../package.json');
const generator = require('./generator');

archLog.info(`Welcome, to HAPI ARCH version ${pkg.version}`);

program
  .version(pkg.version)
  .command('generate <mode>')
  .description('hapi-arch generator command')
  .action((mode) => generator(mode));

program.parse(process.argv);