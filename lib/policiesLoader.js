'use strict';

const modulesLoader = require('./modulesLoader');

let policies = {};

modulesLoader.loadAll(DIRS.METHODS, (module, name) => {
  policies[name] = module;
});

global.policies = policies;