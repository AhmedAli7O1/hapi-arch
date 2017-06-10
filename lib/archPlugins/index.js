"use strict";

const archFs = require("../archFs");
const archLog = require("../archLog");
const APP = require("../text/app.json");
const locations = require("../locations");
const archError = require("../errors")(APP.ARCH_PLUGINS);
const { forEach } = require("lodash");
const ArchPlugin = require("./ArchPlugin");
const co = require("co");

function loadPlugin (pluginName) {
  return co(function* () {

    /*
     - first check the user defined plugins.
     - second check if it's built in module.
     */

    const localPath = archFs.join(__dirname, "builtin", pluginName) + ".js";
    const userPath = archFs.join(locations.ARCH_PLUGINS, pluginName) + ".js";

    if (yield archFs.exist(userPath)) {
      return archFs.load(userPath);
    }
    else if (yield archFs.exist(localPath)) {
      return archFs.load(localPath);
    }
    else {
      archLog.error(archError(`${pluginName} plugin not found!`));
    }

  });
}

function createPlugin (pluginName, components) {
  return co(function* () {

    const loadedPlugin = yield loadPlugin(pluginName);

    if (loadedPlugin) {
      try {
        loadedPlugin.fileName = pluginName;
        const archPlugin = new ArchPlugin(loadedPlugin);
        yield archPlugin.exec(components);
      }
      catch (err) {
        archLog.error(archError(err));
      }
    }

  });
}

function loadArchPlugins (archPluginsList, components) {
  return co(function* () {

    let loadedPlugins = [];

    forEach(archPluginsList, pluginName => {
      loadedPlugins.push(
        createPlugin(pluginName, components)
      );
    });

    yield Promise.all(loadedPlugins);

  });
}

module.exports = loadArchPlugins;