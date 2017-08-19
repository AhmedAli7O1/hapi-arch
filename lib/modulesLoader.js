'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

module.exports = {

  load: function (modulePath, fn) {
    try {
      /* eslint global-require: "off" */
      const loadedModule = require(modulePath);
      return fn ? fn(loadedModule) : loadedModule;
    }
    catch (e) {
      throw e;
    }
  },

  loadAll: function (dirPath, fn) {
    try {
      const modules = [];
      const files = fs.readdirSync(dirPath);
      _.forEach(files, (file) => {
        const loadedModule = this.load(path.join(dirPath, file));
        /* eslint no-magic-numbers: "off" */
        const fileName = file.slice(0, _.findLastIndex(1, '.') -2);
        modules.push(fn ? fn(loadedModule, fileName) : loadedModule);
      });
      return modules;
    }
    catch (e) {
      throw e;
    }
  }

};