"use strict";

const ERRORS = require("../text/errors.json");

function ArchService (options) {

  let missingArgs = [];

  if (!options.name) {
    options.name = options.fileName;
  }

  // check required options exist.
  if (!options.handler) missingArgs.push("handler");

  if (missingArgs.length) {
    throw new Error(`service: ${options.name} - ${ERRORS.AS_REQUIRED_ARGS}: [ ${missingArgs} ]`);
  }

  this.name = options.name;
  this.target = options.target;
  this.handler = options.handler;
  this.requireConfig = options.requireConfig;

}

ArchService.prototype.exec = function (config) {

  const name = this.name;
  const fn = this.handler;
  const requireConfig = this.requireConfig;

  return new Promise((resolve, reject) => {

    // check that the corresponding configuration is exist.
    if (requireConfig && !config[name]) {
      return reject(new Error(`${ERRORS.AS_CONFIG_NOT_FOUND} for the service ${name}`));
    }

    fn(config[name])
      .then(resolve)
      .catch(reject);

  });

};

module.exports = ArchService;
