'use strict';

const Hapi = require('hapi');
const { argv } = require('yargs');
const co = require('co');
const archLog = require('./lib/archLog');
const locations = require('./lib/locations');
const archFs = require('./lib/archFs');
const ERRORS = require('./lib/text/errors.json');
const config = require('./config');
const moment = require('moment');
const _ = require('lodash');
const env = process.env.NODE_ENV || argv.env || 'development';
const appConfig = require('./lib/config');
const pkg = require('./package.json');
const archServices = require('./lib/archServices');
const createServer = require('./lib/server');
const pluginsLoader = require('./lib/plugins');
const archPluginsUtils = require('./lib/archPlugins/utils');
const standards = require('./lib/standards');
const strategies = require('./lib/strategies');

const loadPlugins = function (config) {
  const pluginsPath =
    archFs.join(
      locations.APP_MIN_DIR || process.cwd(),
      archFs.formatPath(config.paths.plugins)
    );

  return pluginsLoader(pluginsPath);
};

const createArch = function (config, appConfig) {
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

    return plugins;

  });
};

const init = function () {
  return co(function* () {

    const serverData = {
      thirdParties: null,
      bootstrap: null,
      arch: null,
      appConfig: null
    };

    /* load app configurations */
    serverData.appConfig = yield appConfig(env);

    /* set globals */
    global._ = _;
    global.moment = moment;
    global.TEST = {};
    global.ENV = env;
    global.CONFIG = serverData.appConfig;

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

    /* load hapi-arch */
    serverData.arch = yield createArch(config, serverData.appConfig);

    return serverData;

  });
};

const applyStandards = function () {

  // run only if you standards is enabled for the current env
  const allowedEnv = _.get(config, 'standards.env');
  if (_.find(allowedEnv, (x) => x === env)) {
    const lintFix = _.find(argv._, (x) => x === 'fix');
    standards({ fix: lintFix });
  }

};

module.exports = function () {
  return co(function* () {

    try {

      archLog.info(`Welcome to Hapi Arch v${pkg.version}`);
      archLog.info(`Environment >> ${env}`);

      applyStandards();

      const serverData = yield init();

      const server = new Hapi.Server();
      server.connection(serverData.appConfig.connection);

      yield strategies(server);

      yield createServer({
        server: server,
        arch: serverData.arch,
        thirdParties: serverData.thirdParties,
        bootstrap: serverData.bootstrap,
        config: serverData.appConfig
      });

      /* eslint no-magic-numbers: "off" */
      archLog.info(`${serverData.arch.length} ${ serverData.arch.length > 1 ? 'Plugins' : 'Plugin' } Loaded!`);

      if (ENV === 'test') {
        /* eslint global-require: "off" */
        require('./lib/test');
      }
      else {
        archLog.info(`API documentation @ ${server.info.uri}/documentation`);
        archLog.info(`Server running @ ${server.info.uri}`);
      }

      return server;

    }
    catch (err) {
      archLog.error(err.stack || err);
      throw err;
    }

  });
};