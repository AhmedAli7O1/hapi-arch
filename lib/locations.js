'use strict';

const fs = require('fs');
const archFs = require('./archFs');
const path = require('path');
const config = require('../config/config.json');

/**
 * get the app main directory.
 * @returns {null|String} directory or null if not found.
 */
const getAppMainDir = function () {
  return searchUp(isAppMainDir) || process.cwd();
};

/**
 * search directories with the given criteria,
 * starting from the current process directory,
 * and up until it reach the root directory.
 * @param criteriaFn function that takes one argument,
 * containing a folder directory, to match with.
 * @returns {null|String} directory path or null if not found.
 */
const searchUp = function (criteriaFn) {

  // get current directory.
  let searchDir = process.cwd();
  let foundDir = null;
  let isSearch = true;

  while (isSearch) {
    const result = criteriaFn(searchDir);
    const parentDir = path.join(searchDir, '..');
    if (!result && parentDir !== searchDir) {
      searchDir = parentDir;
    }
    else if (!result && parentDir === searchDir) {
      // app directory not found.
      isSearch = false;
    }
    else {
      // app directory found.
      foundDir = searchDir;
      isSearch = false;
    }
  }

  return foundDir;

};

/**
 * determine if the given path is the app
 * main directory.
 * @param dirPath {string} directory path,
 * default to the current directory.
 * @returns {boolean}
 */
const isAppMainDir = function (dirPath = process.cwd()) {

  /**
   * app main directory, is the folder
   * that contains the user configurations.
   */
  return fs.existsSync(path.join(dirPath, config.userConfig));

};

const getUserConfigPath = function (mainDir) {
  return archFs.join(mainDir, config.userConfig);
};

const getAppConfigPath = function (mainDir) {
  return archFs.join(mainDir, config.paths.config);
};

const APP_MIN_DIR = getAppMainDir();
const USER_CONFIG = getUserConfigPath(APP_MIN_DIR);
const APP_CONFIG = getAppConfigPath(APP_MIN_DIR);
const ARCH_PLUGINS = archFs.join(APP_MIN_DIR, config.paths.archPlugins);
const ARCH_SERVICES = archFs.join(APP_MIN_DIR, config.paths.archServices);

const locations = {
  APP_MIN_DIR,
  USER_CONFIG,
  APP_CONFIG,
  ARCH_PLUGINS,
  ARCH_SERVICES,
};

module.exports = locations;