"use strict";

/*
  Mongoose ArchPlugin
  ver 1.0.0
 */

const { keys, forEach } = require("lodash");
const mongoose = require("mongoose");
mongoose.Promise = Promise;

function handler (component) {
  return new Promise ((resolve) => {

    // create models.
    forEach(keys(component), key => {
      component[key] = mongoose.model(key, component[key]);
    });

    return resolve(component);

  });
}

module.exports = {
  name: "mongoose",
  target: "models",
  handler: handler
};
