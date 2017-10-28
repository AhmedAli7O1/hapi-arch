'use strict';

const hapi = require('hapi');
const config = require('./config');
const path = require('path');
const paths = require('../text/paths.json');
const fs = require('../utils/fs');

/**
 * the main app class
 * @class HapiArch
 */
class HapiArch {
  constructor(appDir) {
    this.paths = resolvePaths(appDir);
    this.config = resolveConfigs(this.paths.config);
    //const server = hapi.server(config.options);
  }

}

function resolveConfigs(configPath) {
  return config(configPath);
}

function resolvePaths(appDir) {
  paths = utils.fs.resolvePaths(paths, appDir);
  paths.APP_DIR = appDir;
  return paths;
}


module.exports = HapiArch;