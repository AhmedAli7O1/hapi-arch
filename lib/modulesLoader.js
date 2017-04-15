'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {

  /**
   * Load modules from the given folder path,
   * and return an object with loaded modules,
   * and their names.
   * e.g: { User: func... }
   */
  loadAll: function (dir) {
    let modules = {};
    let files = fs.readdirSync(dir);
    _.forEach(files, file => {
      let fileName = file.slice(0, _.findLastIndex(1, '.') -2);
      modules[fileName] = require(path.join(dir, file));
    }); 
    return modules;
  },

  loadAllWithFun (dir, fn) {
    let modules = {};
    let files = fs.readdirSync(dir);
    _.forEach(files, file => {
      let fileName = file.slice(0, _.findLastIndex(1, '.') -2);
      modules[fileName] = require(path.join(dir, file));
      modules[fileName] = fn(path.join(dir, file), fileName);
    }); 
    return modules;
  }

};