"use strict";

const locations = require("../lib/locations");
const archFs = require("../lib/archFs");
const archLog = require("../lib/archLog");
const ERRORS = require("../lib/text/errors.json");

const userConfigPath = locations.USER_CONFIG;

let userConfig = {};

if (archFs.exist(userConfigPath)) {
  userConfig = archFs.load(userConfigPath);
}
else {
  archLog.hint(ERRORS.NO_CONFIG);
}

module.exports = userConfig;
