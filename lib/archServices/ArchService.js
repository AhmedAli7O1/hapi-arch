"use strict";

const ERRORS = require("../text/errors.json");

function ArchPlugin (options) {

  let missingArgs = [];

  // check required options exist.
  if (!options.name) missingArgs.push("name");
  if (!options.handler) missingArgs.push("handler");

  if (missingArgs.length) {
    throw new Error(`service: ${options.name} - ${ERRORS.AS_REQUIRED_ARGS}: ${missingArgs}`);
  }

  this.name = options.name;
  this.target = options.target;
  this.handler = options.handler;
  this.requireConfig = options.requireConfig;

}

ArchPlugin.prototype.exec = function (config) {

  const name = this.name;
  const fn = this.handler;
  const requireConfig = this.requireConfig;

  return new Promise((resolve, reject) => {

    // check that the corresponding configuration is exist.
    if (requireConfig && !config[name]) {
      return reject(`${ERRORS.AS_CONFIG_NOT_FOUND} for the service ${name}`);
    }

    fn(config[name])
      .then(resolve)
      .catch(reject);

  });

};

module.exports = ArchPlugin;
