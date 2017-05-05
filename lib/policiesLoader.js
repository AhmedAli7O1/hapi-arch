'use strict';

const fs = require('fs');
const modulesLoader = require('./modulesLoader');

let policies = {};

if (fs.existsSync(DIRS.POLICIES)) {
  modulesLoader.loadAll(DIRS.POLICIES, (module, name) => {
    policies[name] = module;
  });
}

global.policies = policies;