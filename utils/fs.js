'use strict';

/**
 * filesystem helpers module
 * @module utils/fs
 */

const fse = require("fs-extra");
const _ = require('lodash');
const path = require('path');

function Fs () {}

Fs.prototype = Object.create(fse);
Fs.prototype.formatFileArray = formatFileArray;
Fs.prototype.loadModules = loadModules;
Fs.prototype.dirContent = dirContent;
Fs.prototype.resolvePaths = resolvePaths;
Fs.prototype.canRead = canRead;

/**
 * takes a file paths array and format it
 * then return an array of objects contains 
 * all the available information about the files
 * @param {string[]} filesPath array of strings contains file paths
 * @returns {object[]} array of objects contains the files information
 * @instance
 */
function formatFileArray (filesPath) {
  return _.map(filesPath, filePath => {
    return {
      name: path.basename(filePath, path.extname(filePath)),
      path: filePath,
      extension: path.extname(filePath).replace('.', '')
    };
  });
}


/**
 * load modules with the given paths array
 * @param {string[]} filesPath array of strings contains file paths
 * @returns {object[]} array of objects contains the files content and path
 * @instance
 */
function loadModules(filesPath) {
  return _.map(filesPath, filePath => {
    return {
      path: filePath,
      data: require(filePath)
    };
  });
}

/**
 * get the content of a given directory,
 * and return all sub folders and files
 * @param {string} location directory location
 * @return {object[]} array of objects contains
 * all the sub folders and files for the given directory
 * @instance
 */
async function dirContent(location) {
  const content = await this.readdir(location);
  const folders = [], files = [];

  _.forEach(content, x => {
    if (_.indexOf(x, '.') > -1) {
      files.push(x);
    }
    else {
      folders.push(x);
    }
  });

  return {
    folders,
    files
  };
}

/**
 * resolve an array of paths using a prefix
 * @param {string[]} paths string array contains paths to resolve
 * @param {string} prefix a prefix to resolve for all the given paths
 * @param {function} fn the handler function, will be called with each resolved path
 * @returns {string[]} array of strings represent the resolved paths
 * @instance
 */
function resolvePaths (paths, prefix, fn) {
  const resolved = [];
  _.forEach(paths, pathInfo => {
    const resolvedPath = path.resolve(prefix, pathInfo);
    if (_.isFunction(fn)) {
      fn(resolvedPath);
    }
    resolved.push(resolvedPath);
  });
  return resolved;
}


/**
 * check read permissions for the given file or directory path
 * @param {string} location file or directory path
 * @return {boolean} true if you have read access, otherwise false
 */
async function canRead(location) {
  try {
    await this.access(location, this.constants.R_OK);
    return true;
  }
  catch (e) {
    return false;
  }
}

module.exports = new Fs();
