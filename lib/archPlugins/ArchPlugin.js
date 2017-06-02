"use strict";

const ERRORS = require("../text/errors.json");

function ArchPlugin (options) {

  let missingArgs = [];

  // check required options exist.
  if (!options.name) missingArgs.push("name");
  if (!options.target) missingArgs.push("target");
  if (!options.handler) missingArgs.push("handler");

  if (missingArgs.length) {
    throw new Error(`plugin: ${options.name} - ${ERRORS.AP_REQUIRED_ARGS}: ${missingArgs}`);
  }

  this.name = options.name;
  this.target = options.target;
  this.handler = options.handler;
  this.requireConfig = options.requireConfig;

}

ArchPlugin.prototype.exec = function (components) {

  const fn = this.handler;
  const target = this.target;
  const name = this.name;

  return new Promise((resolve, reject) => {

    // check that the targeted component is exist.
    if (!components[target]) {
      return reject(`${ERRORS.AP_COMP_NOT_FOUND} for the service ${name}`);
    }

    fn(components[target])
      .then(comp => {
        components[target] = comp;
        resolve(components);
      })
      .catch(reject);

  });
};

module.exports = ArchPlugin;
