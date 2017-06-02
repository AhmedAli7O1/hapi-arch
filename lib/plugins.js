const archFs = require("./archFs");
const ERRORS = require("./text/errors.json");
const APP = require("./text/app.json");
const config = require("../config");
const _ = require("lodash");
const archLog = require("./archLog");
const archError = require("./errors")(APP.PLUGINS_LOADER);
const archPlugins = require("./archPlugins");
const co = require("co");


/**
 * given the plugins location, load and exec all the plugins.
 * @param location {String} plugin location.
 * @returns {Array} plugins array.
 */
module.exports = createPlugins;

/* Plugin Constructor and methods */

/**
 * Plugin Constructor.
 * @param location {String} plugin location.
 * @param server {Object} server reference provided by Hapi
 * @param options {Object} plugin options provided by Hapi
 * @constructor {Plugin} Plugin Object
 */
function Plugin ({ location, server, options }) {
  this.location = location;
  this.server = server;
  this.options = options;
  this.components = {};
  this.controllers = {};
  this.services = {};
  this.routes = {};
}

function init () {
  const plugin = this;
  return co(function* () {

    plugin.name = archFs.basename(plugin.location);
    plugin.loadComponents();
    yield plugin.loadArchPlugins();
    plugin.loadServices();
    plugin.loadControllers();
    plugin.loadRoutes();

  });

}

function loadServices () {
  const plugin = this;
  const location = archFs.join(plugin.location, "services");

  archFs.loadAll(location, (loadedModule, moduleName) => {
    plugin.services[moduleName] =
      loadedModule(
        plugin.server,
        plugin.options,
        plugin.components
      );
  });

}

function loadControllers () {
  const plugin = this;
  const location = archFs.join(plugin.location, "controllers");

  archFs.loadAll(location, (loadedModule, moduleName) => {
    plugin.controllers[moduleName] =
      loadedModule(
        plugin.server,
        plugin.options,
        plugin.services
      );
  });

}

/**
 * load the plugin package configuration.
 * @returns {Object} the attributes Object.
 */
function pkg (pluginPath) {
  let attributes = {};

  const pkgPath = archFs.join(pluginPath, "package.json");
  if (archFs.exist(pkgPath)) {
    attributes = archFs.load(pkgPath);
  }
  else {
    attributes = {
      name: archFs.basename(pluginPath),
      version: "0.1.0"
    };
  }

  return attributes;
}

Plugin.prototype.init = init;
Plugin.prototype.loadComponents = loadComponents;
Plugin.prototype.loadServices = loadServices;
Plugin.prototype.loadControllers = loadControllers;
Plugin.prototype.loadRoutes = loadRoutes;
Plugin.prototype.loadArchPlugins = loadArchPlugins;

/**
 * given the plugins location, load and exec all the plugins.
 * @param location {String} plugin location.
 * @returns {Array} array of plugins.
 */
function createPlugins (location) {

  if (!archFs.exist(location)) {
    throw new Error(`${ERRORS.INVALID_PLUGINS_PATH} >> ${location}`);
  }

  // get plugins.
  const pluginsPaths = getPlugins(location);

  if (!pluginsPaths || !pluginsPaths.length) {
    throw new Error(`${ERRORS.NO_PLUGINS} @ ${location}`);
  }

  let plugins = [];

  _.forEach(pluginsPaths, x => plugins.push(createPlugin(x)));

  return plugins;

}

/**
 * using the given plugin path create and return
 * a plugin object.
 * @param pluginPath {String} plugin location.
 * @returns {Object} registrable plugin object.
 */
function createPlugin (pluginPath) {

  const register = function (server, options, next) {

    let plugin = new Plugin({
      location: pluginPath,
      server,
      options
    });

    plugin.init()
      .then(() => {
        server.route(plugin.routes);
        next();
      })
      .catch(err => {
        /*
         just because Hapi will not catch this error when registering
         the plugin, we need to stop the execution here and notify the user.
         */
        archLog.error(archError(err));
        console.log(err);
        process.exit(1);
      });

  };

  register.attributes = pkg(pluginPath);

  return register;

}

// load routes configurations.
function loadRoutes () {
  const plugin = this;
  const routesPath = archFs.join(plugin.location, config.paths.routes);

  if (archFs.exist(routesPath)) {
    plugin.routes = archFs.load(routesPath)(
      plugin.server,
      plugin.options,
      plugin.controllers,
      plugin.components
    );
  }
  else {
    throw new Error(`${ERRORS.NO_ROUTES} >> @ ${plugin.location}`);
  }
}

function getPlugins (location) {

  // first get all plugins.
  const plugins = archFs.getContent(location, "directory");

  // get only allowed plugins.
  const allowedPlugins = archFs.getContent(location, "directory", config.plugins.blacklist);

  const blacklistedPlugins = _.difference(plugins, allowedPlugins);

  if (blacklistedPlugins && blacklistedPlugins.length) {
    showBlacklistedPlugins(blacklistedPlugins);
  }

  return allowedPlugins;

}

function showBlacklistedPlugins(blacklistedPlugins) {
  archLog.hint(
    "Blacklisted Plugins >> ",
    _.map(blacklistedPlugins, x => archFs.basename(x))
  );
}

// load plugin components, which exports Objects.
function loadComponents () {
  const plugin = this;

  const componentsDirectories =
    archFs.getContent(
      plugin.location,
      "directory",
      ["controllers", "services"]
    );

  _.forEach(componentsDirectories, x => {
    let component = {};
    archFs.loadAll(
      x,
      (loadedModule, fileName) => {
        component[fileName] = loadedModule;
      }
    );
    plugin.components[archFs.basename(x)] = component;
  });

}

function loadArchPlugins () {
  const plugin = this;

  return new Promise((resolve) => {

    if (!config.archPlugins || !config.archPlugins.length) {
      resolve();
    }

    archPlugins(config.archPlugins, plugin.components)
      .then(resolve)
      .catch(err => {
        archLog.error(archError(err));
        resolve();
      });

  });

}

