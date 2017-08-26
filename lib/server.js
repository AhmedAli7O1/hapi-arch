'use strict';

const _ = require('lodash');
const ERRORS = require('./text/errors.json');
const co = require('co');

const startServer = function (server, plugins) {
  return new Promise((resolve, reject) => {

    /** register plugins then start the server. */
    server.register(plugins, (err) => {

      if (err) {
        return reject(err);
      }
      // start the server connection.
      server.start((err) => {

        if (err) {
          return reject(err);
        }

        resolve(server);

      });

    });

  });
};

module.exports = function ({ server, arch, thirdParties, bootstrap, config }) {
  return co(function* () {

    if (!config.connection) {
      throw new Error(ERRORS.CONN_CONFIG_NOT_FOUND);
    }

    if (bootstrap) {
      try {
        yield bootstrap(server);
      }
      catch (e) {
        e.message =
          `
          Location: User's bootstrap script
          Error: ${e.message}`;
        throw e;
      }
    }

    let plugins = arch;
    plugins = _.union(plugins, thirdParties);

    yield startServer(server, plugins);

    return server;

  });
};
