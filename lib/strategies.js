'use strict';

const co = require('co');
const archFs = require('./archFs');
const locations = require('./locations');
const config = require('../config');

module.exports = function (server) {
  return co(function* () {

    /* load Strategies */
    const strategiesPath = archFs.join(locations.APP_MIN_DIR, config.paths.strategies);
    if (yield archFs.exist(strategiesPath)) {
      yield archFs.loadAll(
        strategiesPath,
        (loadedModule) => {
          loadedModule(server);
        });
    }

  });

};