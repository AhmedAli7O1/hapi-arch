"use strict";

const _ = require("lodash");
const fs = require("fs");
const path = require("path");

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
    try {
      let modules = [];
      let files = fs.readdirSync(dirPath);
      _.forEach(files, file => {
        let loadedModule = this.load(path.join(dirPath, file));
        let fileName = file.slice(0, _.findLastIndex(1, ".") - 2);
        modules.push(fn ? fn(loadedModule, fileName) : loadedModule);
      });
      return modules;
    }
    catch (e) {
      throw new Error(`${e.message} >> @ ${dirPath}`);
    }
  },

  exist: function (location) {
    return fs.existsSync(location);
  },

  getContent: function (location, types, exclude) {

    let content = fs.readdirSync(location);
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
    try {
      return path.basename(location);
    }
    catch (e) {
      throw new Error(`${e.message} >> @ location`);
    }
  }

};