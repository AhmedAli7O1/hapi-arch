"use strict";

const _ = require("lodash");
const bluebird = require("bluebird");
const fs = bluebird.promisifyAll(require("fs"));
const path = require("path");
const co = require("co");

function getType(name) {

  if (name.indexOf(".") === -1) {
    return "directory";
  }
  else if (name.indexOf(".js") > -1) {
    return "js";
  }
  else if (name.indexOf(".json") > -1) {
    return "json";
  }
  else {
    return "file";
  }

}

module.exports = {

  load: function (modulePath, fn) {
    try {
      const loadedModule = require(modulePath);
      return fn ? fn(loadedModule) : loadedModule;
    }
    catch (e) {
      throw e;
    }
  },

  loadAll: function (dirPath, fn) {

    const self = this;

    return co(function* () {

      let modules = [];
      let files = yield fs.readdirAsync(dirPath);

      files = _.filter(files, x => {
        return path.extname(x) === ".js" || path.extname(x) === ".json";
      });

      _.forEach(files, file => {
        let loadedModule = self.load(path.join(dirPath, file));
        let fileName = file.slice(0, _.findLastIndex(1, ".") - 2);
        modules.push(fn ? fn(loadedModule, fileName) : loadedModule);
      });
      return modules;

    });
  },

  exist: function (location) {
    return new Promise((resolve) => {
      fs.accessAsync(location, fs.constants.F_OK, err => {
        if (err) {
          resolve(false);
        }
        else {
          resolve(true);
        }
      });
    });
  },

  // returns array of paths.
  getContent: function (location, types, exclude) {

    return co(function* () {

      let content = yield fs.readdirAsync(location);
      exclude = exclude || [];

      if (content && types) {
        if (!_.isArray(types)) {
          types = [types];
        }

        content = _.filter(content, x => {
          return _.includes(types, getType(x)) && !_.includes(exclude, x);
        });

      }

      // concatenate paths
      return _.map(content, x => path.join(location, x));

    });

  },

  join: function (...pathParts) {
    return path.join(...pathParts);
  },

  formatPath: function (strPath) {
    if (strPath.indexOf("/") > -1) {
      return this.join(...strPath.split("/"));
    }
    else {
      return strPath;
    }
  },

  basename: function (location) {
    return path.basename(location);
  }

};