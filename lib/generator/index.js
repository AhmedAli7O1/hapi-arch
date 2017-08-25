'use strict';

const path = require('path');
const _ = require('lodash');

// load generators.
const generators = require('./loadGenerators');

/**
 * Generator Main Class
 * @constructor
 */
const Generator = function () {};

Generator.prototype.find = function (type) {
  return generators.find(type);
};

Generator.prototype.generate = function generate (options) {

  if (options.disabled) {
    return;
  }

  // get the generator.
  const generator = generators.find(options.type);

  // check this generator is exist.
  if (!generator) {
    throw new Error(`no generator found with the name ${options.type}`);
  }
  // generate the given component.
  generator(options);

  // check for sub schema.
  if (options.sub) {
    _.forEach(options.sub, (x) => {
      x.location = path.join(options.location, options.name);
      this.generate(x);
    });
  }

};

module.exports = Generator;