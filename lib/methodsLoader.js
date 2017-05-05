'use strict';

const fs = require('fs');
const modulesLoader = require('./modulesLoader');

let methods = {};

if(fs.existsSync(DIRS.METHODS)) {
  modulesLoader.loadAll(DIRS.METHODS, (module, name) => {
    methods[name] = module;
  });
}

module.exports = methods;