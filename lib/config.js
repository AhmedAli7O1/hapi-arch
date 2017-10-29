'use strict';

/**
 * config loader module to load user
 * environment configurations
 * @module lib/config
 */

const fs = require('../utils/fs');
const obj = require('../utils/obj');
const _ = require('lodash');
const path = require('path');
const log = require('../utils/log');
const ERRORS = require('../text/errors.json');


/**
 * load common and environment configurations
 * @param {string} configPath config directory path
 * @param {string} env environment type 
 * e.g development, staging...etc
 * @returns {object} the configuration object
 */
async function load (configPath, env) {
  // get config folder content
  const content = await loadConfigContent(configPath);

  // load common configurations
  const commonConfigInfo = loadConfigModules(content.files, configPath);

  // get environment related config folder content
  const envConfig = await loadEnvConfig(configPath, env);

  // load environment configurations
  let envConfigInfo = null;

  if (envConfig) {
    envConfigInfo = loadConfigModules(envConfig.content, envConfig.dirPath);
  }

  return buildConfigObject(commonConfigInfo, envConfigInfo);
}

/**
 * load all the config directory content
 * @param {string} configPath the path of the config directory
 * @returns {object} contains files and folders, 
 * which is all the config directory content
 */
async function loadConfigContent (configPath) {
  try {
    const content = await fs.dirContent(configPath);
    return content;
  }
  catch (e) {
    e.message = `while trying to load the user config directory ${e.message}`;
    throw e;
  }
}

/**
 * load the environment configurations
 * @param {string} configPath the path 
 * to the config directory
 * @param {string} env the environment 
 * e.g development, staging...etc
 * @returns {object} object contains the config directory
 * content and the directory path
 */
async function loadEnvConfig (configPath, env) {
  if (!env) {
    return null;
  }

  const dirPath = path.resolve(configPath, env);

  if (await fs.canRead(dirPath)) {
    const content = await fs.dirContent(dirPath);
    return { content: content.files, dirPath };
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
function loadConfigModules (configFiles, configPath) {
  if (_.isEmpty(configFiles)) {
    return null;
  }

  // resolve config files paths
  const configPaths = [];
  fs.resolvePaths(configFiles, configPath, (resolvedPath) =>
    configPaths.push(resolvedPath)
  );

  // format the paths array to split information, e.g name, path, ext...etc
  const formattedPathsArray = fs.formatFileArray(configPaths);

  // load all the config files from the paths string array
  const configs = fs.loadModules(configPaths);

  // add the loaded modules data to the formatted array
  _.forEach(configs, (configFile) => {
    const formattedPath = _.find(
      formattedPathsArray,
      (x) => x.path === configFile.path
    );
    formattedPath.data = configFile.data;
  });

  return formattedPathsArray;
}


/**
 * takes common and env configurations arrays 
 * of the loaded config files information
 * @param {array[]} common loaded common configuration 
 * @param {array[]} env loaded common configuration
 * @returns {object} merged configuration object
 */
function buildConfigObject (common, env) { 
  common = obj.arrayToObject(common, 'name', 'data');
  env = obj.arrayToObject(env, 'name', 'data');
  return _.merge(common, env);
}


module.exports = {
  load,

  // exposing those functions for the test cases only
  _test: {
    load,
    loadConfigModules,
    buildConfigObject
  }
};
