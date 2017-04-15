'use strict';

module.exports = function (settings) {

  const path = require('path');
  const co = require('co');

  /** SET GLOBALS */
  require('./lib/globals');
  /** LOAD DIRECTORIES */
  require('./lib/dirs');
  /** LOAD CONFIGURATIONS */
  require('./lib/configLoader');

  const register = function (server, options, next) {

    co(function *() {

      try {

        // check if the user need mongo.
        const mongo = _.get(settings, 'config.options.MongoDB');
        let db = null;
        if (mongo) {
          const mongooseLib = require('./lib/mongooseLib');
          db = yield mongooseLib.createConnection();
        }

        /** LOAD METHODS */
        const methods = require('./lib/methodsLoader');
        /** LOAD POLICIES */
        const policies = require('./lib/policiesLoader');
        /** LOAD PLUGINS */
        const inject = {
          server: server,
          options: options,
          db: db,
          methods: methods,
          policies: policies
        };

        require('./lib/pluginsLoader')(inject, settings);
        return next();

      }
      catch (e) {
        console.log(e);
        process.exit(1);
      }

    });

  };

  register.attributes = {
    pkg: require('./package.json')
  };

  return register;

};