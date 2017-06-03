"use strict";

const path = require("path");
const modulesLoader = require("../modulesLoader");
const _ = require("lodash");

const generators = modulesLoader.loadAll(
    path.join(__dirname, "generators"),
    (module, name) => {
      return { name: name, generator: module };
    });

module.exports = {

  find: function (name) {
    let foundGenerator = _.find(generators, x => x.name === name);
    return foundGenerator ? foundGenerator.generator : null;
  }

};