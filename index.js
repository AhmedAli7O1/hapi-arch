"use strict";

const archLog = require("./lib/archLog");
const locations = require("./lib/locations");
const archFs = require("./lib/archFs");
const ERRORS = require("./lib/text/errors.json");
const config = require("./config");

module.exports = function () {

  /** SET GLOBALS */
  require("./lib/globals");
  /** LOAD DIRECTORIES */
  require("./lib/dirs");
  /** LOAD CONFIGURATIONS */
  require("./lib/configLoader");

  const pluginsPath =
    archFs.join(
      locations.getAppMainDir() || process.cwd(),
      archFs.formatPath(config.paths.plugins)
    );

  try {
    const pluginsLoader = require("./lib/plugins");
    const plugins = pluginsLoader(pluginsPath) || [];

    if (plugins.length) {

      const register = function (server, options, next) {

        server.register(plugins);
        archLog.info(`${plugins.length} ${ plugins.length > 1 ? "Plugins" : "Plugin" } Loaded!`);

        archLog.info(`Environment >> ${ENV}`);
        next();

      };

      register.attributes = {
        pkg: require("./package.json")
      };

      return register;

    }
    else {
      archLog.error(ERRORS.NO_PLUGINS);
      process.exit(1);
    }
  }
  catch (err) {
    archLog.error(err);
    process.exit(1);
  }

};