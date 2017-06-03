"use strict";

const co = require("co");
const archLog = require("./lib/archLog");
const locations = require("./lib/locations");
const archFs = require("./lib/archFs");
const ERRORS = require("./lib/text/errors.json");
const config = require("./config");
const moment = require("moment");
const _ = require("lodash");
const env = process.env.NODE_ENV || "development";
let appConfig = require("./lib/config");
const pkg = require("./package.json");
const archServices = require("./lib/archServices");
const createServer = require("./lib/server");
const pluginsLoader = require("./lib/plugins");
const archPluginsUtils = require("./lib/archPlugins/utils");

function loadPlugins (config) {
  const pluginsPath =
    archFs.join(
      locations.APP_MIN_DIR || process.cwd(),
      archFs.formatPath(config.paths.plugins)
    );

  return pluginsLoader(pluginsPath);
}

function createArch (config, appConfig) {
  return co(function* () {

    if (config.archServices && config.archServices.length) {
      yield archServices(config.archServices, appConfig);
    }

    if (config.archPlugins && config.archPlugins.length) {
      config.archPlugins = yield archPluginsUtils.validatePlugins(config.archPlugins);
    }

    const plugins = yield loadPlugins(config, appConfig);

    if (!plugins || !plugins.length) {
      throw new Error(ERRORS.NO_PLUGINS);
    }

    const register = function (server, options, next) {

      server.register(plugins);
      archLog.info(`${plugins.length} ${ plugins.length > 1 ? "Plugins" : "Plugin" } Loaded!`);
      archLog.info(`Environment >> ${env}`);
      archLog.info(`API documentation @ ${server.info.uri}/documentation`);
      next();

    };

    register.attributes = {
      pkg: pkg
    };

    return register;

  });
}

function init () {
  return co(function* () {

    archLog.info(`Welcome to Hapi Arch v${pkg.version}`);

    let serverData = {
      thirdParties: null,
      bootstrap: null,
      arch: null,
      appConfig: null
    };

    /* load third parties */
    const thirdPartiesPath = archFs.join(locations.APP_MIN_DIR, config.paths.thirdParties);
    if (yield archFs.exist(thirdPartiesPath)) {
      serverData.thirdParties = archFs.load(thirdPartiesPath);
    }

    /* load bootstrap */
    const bootstrapPath = archFs.join(locations.APP_MIN_DIR, config.paths.bootstrap);
    if (yield archFs.exist(bootstrapPath)) {
      serverData.bootstrap = archFs.load(bootstrapPath);
    }

    /* load app configurations */
    serverData.appConfig = yield appConfig(env);

    /* load hapi-arch */
    serverData.arch = yield createArch(config, serverData.appConfig);

    /* set globals */
    global._ = _;
    global.moment = moment;
    global.TEST = [];
    global.ENV = env;
    global.CONFIG = serverData.appConfig;

    return serverData;

  });
}

module.exports = function () {
  return co(function* () {

    try {

      const serverData = yield init();

      const server = yield createServer({
        arch: serverData.arch,
        thirdParties: serverData.thirdParties,
        bootstrap: serverData.bootstrap,
        config: serverData.appConfig
      });

      archLog.info(`Server running @ ${server.info.uri}`);

      return server;

    }
    catch (err) {
      archLog.error(err.stack || err);
      throw err;
    }

  });
};