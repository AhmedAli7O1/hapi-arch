'use strict';

const path = require("path");
const archFs = require("../archFs");
const _ = require("lodash");

const generators = archFs.loadAll(
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