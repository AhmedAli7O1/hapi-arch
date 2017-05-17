const loader = require("../utils/loader");
const ERRORS = require("../text/errors.json");
const APP = require("../text/app.json");
const archError = require("../errors/plugins");

/**
 * plugin.js is a Hapi Arch Loader.
 * the purpose of this loader is to:
 * 1. load routes.
 * 2. load plugin folders.
 *    - the user can create folders with any name
 *      except the reserved folders names:
 *       * models
 *       * test
 *
 */

module.exports = function (location) {
  try {
    load(location);
  }
  catch (err) {
    throw archError({
      name: APP.PLUGINS_LOADER,
      message: ERRORS.TITLES.PLUGINS_LOADER,
      cause: err
    });
  }
};

/**
 * load plugin from the given path.
 * @param location {string} the plugin location.
 */
function load (location) {
  let plugin = {};
  plugin.routes = loadRoutes(location);
}

// load routes
function loadRoutes (location) {
  if (loader.exist(location)) {
    return loader.load(location);
  }
  else {
    throw new Error(ERRORS.NO_ROUTES);
  }
}