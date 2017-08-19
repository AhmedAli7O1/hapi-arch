'use strict';

/*
  Mongoose ArchPlugin
  ver 1.0.0
 */

const { keys, forEach } = require('lodash');
const mongoose = require('mongoose');
mongoose.Promise = Promise;

const handler = function (component) {
  return new Promise ((resolve) => {

    // create models.
    forEach(keys(component), (key) => {
      component[key] = mongoose.model(key, component[key]);
    });

    return resolve(component);

  });
};

module.exports = {
  target: 'models',
  handler: handler
};
