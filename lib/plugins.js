const archFs = require('./archFs');
const ERRORS = require('./text/errors.json');
const APP = require('./text/app.json');
const config = require('../config');
const _ = require('lodash');
const archLog = require('./archLog');
const archError = require('./errors')(APP.PLUGINS_LOADER);
const archPlugins = require('./archPlugins');
const co = require('co');
const crontask = require('./crontask');
const ERROR_CODE = 1;

const loadComp = function (components, compDir) {
  return co(function* () {

    const component = {};

    yield archFs.loadAll(
      compDir,
      (loadedModule, fileName) => {
        component[fileName] = loadedModule;
      }
    );

    components[archFs.basename(compDir)] = component;

  });
};

const pkg = function (pluginPath) {

  let attributes = {};

  const pkgPath = archFs.join(pluginPath, 'package.json');

  try {
    attributes = archFs.load(pkgPath);
  }
  catch (e) {
    attributes = {
      name: archFs.basename(pluginPath),
      version: '0.1.0'
    };
  }

  return attributes;

};

const getPlugins = function (location) {
  return co(function* () {

    // first get all plugins.
    const plugins = yield archFs.getContent(location, 'directory');

    // get only allowed plugins.
    const allowedPlugins = yield archFs.getContent(location, 'directory', config.plugins.blacklist);

    const blacklistedPlugins = _.difference(plugins, allowedPlugins);

    if (blacklistedPlugins && blacklistedPlugins.length) {
      showBlacklistedPlugins(blacklistedPlugins);
    }

    return allowedPlugins;

  });
};

const showBlacklistedPlugins = function (blacklistedPlugins) {
  archLog.hint(
    'Blacklisted Plugins >> ',
    _.map(blacklistedPlugins, (x) => archFs.basename(x))
  );
};

/**
 * using the given plugin path create and return
 * a plugin object.
 * @param pluginPath {String} plugin location.
 * @returns {Object} registrable plugin object.
 */
const createPlugin = function (pluginPath) {

  const register = function (server, options, next) {

    const plugin = new Plugin({
      location: pluginPath,
      server,
      options
    });

    server.on('start', function () {
      crontask(plugin.crontasks);
    });

    plugin.init()
      .then(() => {
        if (!_.isEmpty(plugin.routes)) {
          server.route(plugin.routes);
        }
        next();
      })
      .catch((err) => {
        /*
         just because Hapi will not catch this error when registering
         the plugin, we need to stop the execution here and notify the user.
         */
        archLog.error(archError(err.stack));
        process.exit(ERROR_CODE);
      });

  };

  register.attributes = pkg(pluginPath);

  return register;

};

/**
 * given the plugins location, load and exec all the plugins.
 * @param location {String} plugin location.
 * @returns {Array} array of plugins.
 */
const createPlugins = function (location) {
  return co(function* () {

    // plugin directory exist.
    const pluginDirExist = yield archFs.exist(location);

    if (!pluginDirExist) {
      throw new Error(`${ERRORS.INVALID_PLUGINS_PATH} >> ${location}`);
    }

    // get plugins paths.
    const pluginsPaths = yield getPlugins(location);

    if (!pluginsPaths || !pluginsPaths.length) {
      throw new Error(`${ERRORS.NO_PLUGINS} @ ${location}`);
    }

    const plugins = [];

    _.forEach(pluginsPaths, (x) => plugins.push(createPlugin(x)));

    return plugins;

  });
};

const loadComponents = function () {
  const plugin = this;

  return co(function* () {

    const componentsDirectories =
      yield archFs.getContent(
        plugin.location,
        'directory', ['controllers', 'services', 'test']
      );

    const promiseArray = [];

    _.forEach(componentsDirectories, (x) => {
      promiseArray.push(loadComp(plugin.components, x));
    });

    return yield Promise.all(promiseArray);

  });

};

const loadArchPlugins = function () {
  const plugin = this;

  return new Promise((resolve) => {

    if (!config.archPlugins || !config.archPlugins.length) {
      resolve();
    }

    archPlugins(config.archPlugins, plugin.components)
      .then(resolve)
      .catch((err) => {
        archLog.error(archError(err));
        resolve();
      });

  });

};

const loadServices = function () {
  const plugin = this;

  return co(function* () {

    const location = archFs.join(plugin.location, 'services');

    yield archFs.loadAll(location, (loadedModule, moduleName) => {
      plugin.services[moduleName] =
        loadedModule(
          plugin.server,
          plugin.options,
          plugin.components
        );
    });

  });

};

const loadControllers = function () {
  const plugin = this;

  return co(function* () {

    const location = archFs.join(plugin.location, 'controllers');

    yield archFs.loadAll(location, (loadedModule, moduleName) => {
      plugin.controllers[moduleName] =
        loadedModule(
          plugin.server,
          plugin.options,
          plugin.services
        );
    });

  });

};

const loadCrontasks = function () {
  const plugin = this;

  return co(function* () {

    const location = archFs.join(plugin.location, 'crontasks');

    if (yield archFs.exist(location)) {
      yield archFs.loadAll(location, (loadedModule, moduleName) => {
        plugin.crontasks[moduleName] =
          loadedModule(
            plugin.server,
            plugin.options,
            plugin.controllers,
            plugin.services,
            plugin.components
          );
      });
    }

  });

};

const loadRoutes = function () {
  const plugin = this;

  return co(function* () {

    const routesPath = archFs.join(plugin.location, config.paths.routes);

    if (yield archFs.exist(routesPath)) {
      plugin.routes = archFs.load(routesPath)(
        plugin.server,
        plugin.options,
        plugin.controllers,
        plugin.components
      );
    }

  });

};

const loadTest = function () {
  const plugin = this;
  return co(function* () {

    const location = archFs.join(plugin.location, 'test');

    const pluginTestFiles = [];

    yield archFs.loadAll(location, (loadedModule) => {
      pluginTestFiles.push(
        loadedModule(
          plugin.server,
          plugin.options,
          plugin.services,
          plugin.components
        )
      );
    });

    global.TEST[plugin.name] = pluginTestFiles;

  });
};

const init = function () {
  const plugin = this;
  return co(function* () {

    plugin.name = archFs.basename(plugin.location);
    yield plugin.loadComponents();
    yield plugin.loadArchPlugins();
    yield plugin.loadServices();
    yield plugin.loadControllers();
    yield plugin.loadCrontasks();
    yield plugin.loadRoutes();
    if (ENV === 'test') {
      yield plugin.loadTest();
    }

  });

};

/**
 * Plugin Constructor.
 * @param location {String} plugin location.
 * @param server {Object} server reference provided by Hapi
 * @param options {Object} plugin options provided by Hapi
 * @constructor {Plugin} Plugin Object
 */
const Plugin = function ({
  location,
  server,
  options
}) {
  this.location = location;
  this.server = server;
  this.options = options;
  this.components = {};
  this.controllers = {};
  this.services = {};
  this.crontasks = {};
  this.routes = {};
};

Plugin.prototype.init = init;
Plugin.prototype.loadComponents = loadComponents;
Plugin.prototype.loadArchPlugins = loadArchPlugins;
Plugin.prototype.loadServices = loadServices;
Plugin.prototype.loadControllers = loadControllers;
Plugin.prototype.loadCrontasks = loadCrontasks;
Plugin.prototype.loadRoutes = loadRoutes;
Plugin.prototype.loadTest = loadTest;

module.exports = createPlugins;