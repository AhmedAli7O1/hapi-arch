"use strict";

const archFs = require("../archFs");
const archLog = require("../archLog");
const APP = require("../text/app.json");
const locations = require("../locations");
const archError = require("../errors")(APP.ARCH_PLUGINS);
const { merge, forEach } = require("lodash");
const ArchPlugin = require("./ArchPlugin");

function loadPlugin (pluginName) {
  try {

    /*
     - first check the user defined plugins.
     - second check if it's built in module.
     */

    const localPath = archFs.join(__dirname, pluginName) + ".js";
    const userPath = archFs.join(locations.ARCH_SERVICES, pluginName) + ".js";

    if (archFs.exist(userPath)) {
      return archFs.load(userPath);
    }
    else if (archFs.exist(localPath)) {
      return archFs.load(localPath);
    }
    else {
      archLog.error(archError(`${pluginName} plugin not found!`));
    }

  }
  catch (err) {
    archLog.error(archError(err));
  }
}

function loadArchPlugins (archPluginsList, components) {

  return new Promise((resolve) => {

    let loadedPlugins = [];

    forEach(archPluginsList, pluginName => {
      const loadedPlugin = loadPlugin(pluginName);
      if (loadedPlugin) {
        try {
          const archPlugin = new ArchPlugin(loadedPlugin);
          loadedPlugins.push(archPlugin.exec(components));
        }
        catch (err) {
          archLog.error(archError(err));
        }
      }
    });

    Promise.all(loadedPlugins)
      .then(resolve)
      .catch(err => {
        archLog.error(archError(err));
        resolve();
      });

  });
}

module.exports = loadArchPlugins;