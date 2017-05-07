"use strict";

const fs = require('fs');
const path = require('path');
const config = require('../../config');

/**
 * get the app main directory.
 * @returns {null|String} directory or null if not found.
 */
function getAppMainDir () {
  return searchUp(isAppMainDir);
}

/**
 * search directories with the given criteria,
 * starting from the current process directory,
 * and up until it reach the root directory.
 * @param criteriaFn function that takes one argument,
 * containing a folder directory, to match with.
 * @returns {null|String} directory path or null if not found.
 */
function searchUp (criteriaFn) {

  // get current directory.
  let searchDir = process.cwd();
  let foundDir = null;
  let isSearch = true;

  while (isSearch) {
    let result = criteriaFn(searchDir);
    let parentDir = path.join(searchDir, '..');
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

}

/**
 * determine if the given path is the app
 * main directory.
 * @param dirPath {string} directory path,
 * default to the current directory.
 * @returns {boolean}
 */
function isAppMainDir (dirPath = process.cwd()) {

  /**
   * app main directory, is the folder
   * that contains the user configurations.
   */
  return fs.existsSync(path.join(dirPath, config.userConfig));

}

module.exports.app = getAppMainDir;