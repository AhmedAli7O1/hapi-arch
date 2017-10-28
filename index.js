'use strict';

const path = require('path');
const appDir = path.resolve('../../');
const HapiArch = require('./lib/hapiArch');

module.exports = new HapiArch(appDir);