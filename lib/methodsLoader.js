'use strict';

const _ = require('lodash');
const modulesLoader = require('./modulesLoader');

let methods = {};

modulesLoader.loadAll(DIRS.METHODS, (module, name) => {
  methods[name] = module;
});

module.exports = methods;