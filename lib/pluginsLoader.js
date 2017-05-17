'use strict';

const fs = require('fs');
const path = require('path');
const colors = require('colors/safe');
const _ = require('lodash');
const modulesLoader = require('./modulesLoader');
let db = null;
let methods = null;
let pluginsConfig;

function init (inject, settings) {

  const {server, options} = inject;

  db = inject.db;
  methods = inject.methods;
  
  // set user configuration if exist.
  if (settings)
    pluginsConfig = _.get(settings, 'config.plugins');

  const blacklist = (pluginsConfig && _.isArray(pluginsConfig.blacklist) && pluginsConfig.blacklist.length ? pluginsConfig.blacklist : null);

  let pluginsDirs = fs.readdirSync(DIRS.PLUGINS);

  let plugins = [];

  _.forEach(pluginsDirs, plugin => {

    if (blacklist && _.find(blacklist, x => x === plugin)) {
      console.log(colors.yellow(`[ HAPI ARCH ] Blacklisted Plugin >> ${plugin}`));
      return;
    }

    let createdPlugin = createPlugin({
      name: plugin,
      path: path.join(DIRS.PLUGINS, plugin), 
      controllers: {},
      services: {},
      models: {},
      schema: {},
      routes: []
    });

    plugins.push(createdPlugin);

  });

  if (plugins.length) {
    server.register(plugins);
    console.log(colors.green(`[ HAPI ARCH ] ${plugins.length} ${ plugins.length > 1 ? 'Plugins' : 'Plugin' } Loaded`));
  }

}

function createPlugin (pluginData) {

  pluginData = populatePluginPaths(pluginData);
  const register = function (server, options, next) {
    
    if (db) loadModels(pluginData);
    loadServices(pluginData, server, options);
    loadControllers(pluginData, server, options);
    loadSchema(pluginData);
    loadRoutes(pluginData);

    if (pluginData.test)
      global.TEST = _.union(global.TEST, pluginData.test);
    
    if (pluginData.routes.length)
      server.route(pluginData.routes);
    next();
  };

  register.attributes = pluginData.pkg ? require(pluginData.pkg) : { name: pluginData.name, version: '1.0.0' };
  return register;

}

function populatePluginPaths (pluginData) {
  // plugin content.
  let content = fs.readdirSync(pluginData.path);
  let folders = _.filter(content, x => x.indexOf('.') <= 0);
  let modules = _.filter(content, x => x.indexOf('.') >= 0 && x !== 'package.json');
  let pkg = _.find(content, x => x === 'package.json');

  pluginData.content = content;
  pluginData.folders = folders;  
  pluginData.modules = modules;
  pluginData.pkg = pkg ? path.join(pluginData.path, pkg) : null;

  if (ENV === 'test' && folders.indexOf('test') >= 0) {
    pluginData.test = fs.readdirSync(path.join(pluginData.path, 'test'));
    pluginData.test = _.map(pluginData.test, testFile => path.join(pluginData.path, 'test', testFile));
  }

  return pluginData;

}

function loadModels (pluginData) {
  try {
    if (pluginData.folders.indexOf('models') >= 0) {
      pluginData.models = {};
      modulesLoader.loadAll(
          path.join(pluginData.path, 'models'),
          (module, moduleName) => {
            pluginData.models[moduleName] = db.model(moduleName, module);
          });

    }

    return pluginData;
  }
  catch (e) {
    console.log(`[ MODELS LOADER ]`, e);
    process.exit(1);
  }
}

function loadServices (pluginData, server, options) {
  try {
    if (pluginData.folders.indexOf('services') >= 0) {
      pluginData.services = {};

      modulesLoader.loadAll(
          path.join(pluginData.path, 'services'),
          (module, moduleName) => {
            pluginData.services[moduleName] = module(server, options, pluginData.models, methods);
          });

    }

    return pluginData;
  }
  catch (e) {
    console.log(`[ SERVICES LOADER ]`, e);
    process.exit(1);
  }
}

function loadControllers (pluginData, server, options) {
  try {
    if (pluginData.folders.indexOf('controllers') >= 0) {
      pluginData.controllers = {};

      modulesLoader.loadAll(
          path.join(pluginData.path, 'controllers'),
          (module, moduleName) => {
            pluginData.controllers[moduleName] = module(server, options, pluginData);
          });
    }

    return pluginData;
  }
  catch (e) {
    console.log(`[ CONTROLLERS LOADER ]`, e);
    process.exit(1);
  }
}

function loadSchema (pluginData) {
  try { 
    if (pluginData.folders.indexOf('schema') >= 0) {
      pluginData.schema = {};
      modulesLoader.loadAll(
          path.join(pluginData.path, 'schema'),
          (module, moduleName) => {
            pluginData.schema[moduleName] = module;
          });
    }

    return pluginData;
  }
  catch (e) {
    console.log(`[ SCHEMA LOADER ]`, e);
    process.exit(1);
  }
}

function loadRoutes (pluginData) {
  try {
    if (pluginData.modules.indexOf('routes.js') >= 0)
      pluginData.routes = 
        require(path.join(pluginData.path, 'routes.js'))(pluginData.controllers, pluginData.schema);

    return pluginData;
  }
  catch (e) { 
    console.log(`[ ROUTES LOADER ]`, e);
    process.exit(1);
  }
}

function loadTest (pluginData) {
  try {
    if (pluginData.folders.indexOf('test') >= 0)
      pluginData.test = modulesLoader.loadAll();
  }
  catch (e) {
    console.log(`[ TEST LOADER ]`, e);
    process.exit(1);
  }
}

function getPluginFolders (pluginPath) {
  const pluginFolders = fs.readdirSync(pluginPath);
  _.forEach(pluginFolders, x => {
    loadFolder();
  });
}

function loadFolder (args) {

  const {dir, name, plugin, server, options} = args;

  try {
    modulesLoader.loadAll(dir, (module, moduleName) => {
      plugin[name][moduleName] = module(server, options, plugin);
    });
  }
  catch (err) {
    console.log(`[ Arch Loader ]`, err);
  }

}

module.exports = init;