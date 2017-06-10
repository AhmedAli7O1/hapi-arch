"use strict";

const archFs = require("../archFs");
const archLog = require("../archLog");
const locations = require("../locations");
const co = require("co");
const _ = require("lodash");

function getAllPlugins () {
  return co(function* () {

    const builtinPath = archFs.join(__dirname, "builtin");
    const userDefinedPath = locations.ARCH_PLUGINS;

    let builtin = yield archFs.getContent(builtinPath, "js");
    builtin = _.map(builtin, x => archFs.basename(x).replace(".js", ""));

    let userDefined = [];

    if (yield archFs.exist(userDefinedPath)) {
      userDefined = yield archFs.getContent(userDefinedPath, "js");
      userDefined = _.map(userDefined, x => archFs.basename(x).replace(".js", ""));
    }

    return _.union(builtin, userDefined);

  });
}

function validatePlugins (pluginList) {
  return co(function* () {

    let existingPlugins = yield getAllPlugins();

    const notExist = _.difference(pluginList, existingPlugins);

    if (notExist && notExist.length) {
      _.forEach(notExist, x => archLog.error(`arch plugin ${x} not found!`));
    }

    return _.intersection(pluginList, existingPlugins);

  });
}

module.exports = {
  getAllPlugins,
  validatePlugins
};