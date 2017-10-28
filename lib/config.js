'use strict';

/**
 * config loader module to load user
 * environment configurations
 * @module lib/config
 */

const fs = require('../utils/fs');
const _ = require('lodash');
const path = require('path');
const log = require('../utils/log');
const ERRORS = require('../text/errors.json');

async function load(configPath, env) {
  
  // get config folder content
  const content = await loadConfigContent(configPath);

  // load common configurations
  const commonConfigInfo = loadConfigModules(content.files, configPath);
  
  // get environment related config folder content
  const envConfigContent = await loadEnvConfig(configPath, env);

  // load environment configurations
  let envConfigInfo = null;

  if (envConfigContent) {
    envConfigInfo = loadConfigModules(envConfigContent.files, configPath);
  }

  return buildConfigObject(commonConfigInfo);

}


async function loadConfigContent(configPath) {
  try {
    const content = await fs.dirContent(configPath);
    return content;
  }
  catch (e) {
    e.message = `while trying to load the user config directory ${e.message}`;
    throw e;
  }
}

async function loadEnvConfig(configPath, env) {
  if (!env) return null;

  const dirPath = path.resolve(configPath, env);

  if (await fs.canRead(dirPath)) {
    const content = await fs.dirContent(dirPath);
    return content;
  }
  else {
    log.warn(ERRORS.NO_ENV_CONFIG);
    return null;
  }
}


/**
 * load user configurations from a given folder
 * @param {string[]} configFiles string array contains config files path
 * @param {string} configPath the main config folder path
 * @returns {object[]} array of objects contains all the information about the loaded config files
 * [ name, path, extension, data ]
 */
function loadConfigModules(configFiles, configPath) {

  if (_.isEmpty(configFiles)) return null;

  // resolve config files paths
  const configPaths = [];
  fs.resolvePaths(configFiles, configPath, resolvedPath => configPaths.push(resolvedPath));

  // format the paths array to split information, e.g name, path, ext...etc
  const formattedPathsArray = fs.formatFileArray(configPaths);

  // load all the config files from the paths string array
  const configs = fs.loadModules(configPaths);

  // add the loaded modules data to the formatted array
  _.forEach(configs, configFile => {
    const formattedPath = _.find(formattedPathsArray, x => x.path === configFile.path);
    formattedPath.data = configFile.data;
  });

  return formattedPathsArray;

}


/**
 * takes an array of the loaded config files information
 * and return it in a config object style
 * @param {object[]} configArray array of objects contains the loaded config files
 * with at least, name and data properties
 * @returns {object} contains the loaded config files, 
 * so every file will be a sub object
 */
function buildConfigObject (configArray) {
  const config = {};
  _.forEach(configArray, configItem => {
    config[configItem.name] = configItem.data;
  });
  return config;
}


module.exports = {
  load,
  _test: {
    load,
    loadConfigModules,
    buildConfigObject
  }
};
