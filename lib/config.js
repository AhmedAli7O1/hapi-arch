'use strict';

const _ = require('lodash');
const locations = require('./locations');
const archFs = require('./archFs');
const ERRORS = require('./text/errors.json');
const co = require('co');

module.exports = function (env) {
  return co(function* () {

    /*
     1. load common configurations.
     2. load environment configurations, and override common.
     */
    const configPath = locations.APP_CONFIG;
    const appConfigExist = yield archFs.exist(configPath);
    if (appConfigExist) {
      const appConfig = {};

      yield archFs.loadAll(
        configPath,
        (loadedModule, moduleName) => {
          appConfig[moduleName] = loadedModule;
        }
      );

      const envConfig = archFs.join(configPath, env);
      const envConfigExist = yield archFs.exist(envConfig);

      if (envConfigExist) {
        yield archFs.loadAll(
          envConfig,
          (loadedModule, moduleName) => {
            if (!appConfig[moduleName]) {
              appConfig[moduleName] = loadedModule;
            }
            else {
              _.merge(appConfig[moduleName], loadedModule);
            }
          }
        );
      }

      return appConfig;

    }
    else {
      throw new Error(ERRORS.NO_APP_CONFIG_DIR);
    }

  });
};