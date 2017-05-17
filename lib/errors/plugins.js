"use strict";

const {VError} = require("verror");
const APP = require("../text/app.json");

function pluginLoaderError (options) {

  options.name = `${APP.NAME_CONSOLE} - ${options.errorType}`;

  return new VError(options, options.message);
}

module.exports = {
  pluginLoaderError
};