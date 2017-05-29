"use strict";

const _ = require("lodash");
const locations = require("./locations");
const archFs = require("./archFs");
const ERRORS = require("./text/errors.json");

module.exports = function (env) {
  /*
    1. load common configurations.
    2. load environment configurations, and override common.
   */
  const configPath = locations.getAppConfigPath();

  if (archFs.exist(configPath)) {
    let appConfig = {};

    archFs.loadAll(
      configPath,
      (loadedModule, moduleName) => {
        appConfig[moduleName] = loadedModule;
      }
    );

    const envConfig = archFs.join(configPath, env);

    if (archFs.exist(envConfig)) {
      archFs.loadAll(
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

};