'use strict';

module.exports = function (settings) {

  const mongooseLib = require('./lib/mongooseLib');
  const path = require('path');

  /** SET GLOBALS */
  require('./lib/globals');
  /** LOAD DIRECTORIES */
  require('./lib/dirs');
  /** LOAD CONFIGURATIONS */
  require('./lib/configLoader');

  const register = function (server, options, next) {
    let _db;
    /** CONNECT TO DB */
    mongooseLib.createConnection()
      .then(db => {
        _db = db;
        if (settings && settings.config && settings.config.bootstrap)
         return require(path.join(DIRS.HOME_DIR ,settings.config.bootstrap))();
        else return;
      })
      .then(() => {
        const methods = require('./lib/methodsLoader');
        const policies = require('./lib/policiesLoader');
        /** LOAD PLUGINS */
        const inject = {
          server: server,
          options: options,
          db: _db,
          methods: methods,
          policies: policies
        };

        require('./lib/pluginsLoader')(inject, settings);
        return next();
      })
      .catch(err => {
        console.log(err);
        process.exit(1);
      });
  };

  register.attributes = {
    pkg: require('./package.json')
  };

  return register;

};