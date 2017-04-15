'use strict';

const isExist = require('./isExist');
const getPath = require('./getPath');
let archConfig = null;

module.exports = function () {
  if (!archConfig && isExist('archConfig')) archConfig = require(getPath('archConfig'));
  return archConfig;
};