"use strict";

const archFs = require("../archFs");
const archLog = require("../archLog");
const APP = require("../text/app.json");
const locations = require("../locations");
const archError = require("../errors")(APP.ARCH_SERVICE);
const { forEach } = require("lodash");
const ArchService = require("./ArchService");
const co = require("co");

function loadService (serviceName) {
  return co(function* () {

    /*
     - first check the user defined services.
     - second check if it's built in module.
     */

    const localPath = archFs.join(__dirname, "builtin", serviceName) + ".js";
    const userPath = archFs.join(locations.ARCH_SERVICES, serviceName) + ".js";

    if (yield archFs.exist(userPath)) {
      return archFs.load(userPath);
    }
    else if (yield archFs.exist(localPath)) {
      return archFs.load(localPath);
    }
    else {
      archLog.error(archError(`service ${serviceName} not found!`));
    }

  });

}

function createService (serviceName, appConfig) {
  return co(function* () {

    const loadedService = yield loadService(serviceName);
    if (loadedService) {
      try {
        loadedService.fileName = serviceName;
        const archService = new ArchService(loadedService);
        yield archService.exec(appConfig);
      }
      catch (err) {
        throw err;
      }
    }

  });
}

function loadArchServices (archServicesList, appConfig) {
  return co(function* () {

    if (!archServicesList && !archServicesList.length) {
      return;
    }

    let loadedServices = [];

    forEach(archServicesList, serviceName => {
      loadedServices.push(
        createService(serviceName, appConfig)
      );
    });

    yield Promise.all(loadedServices);

  });
}

module.exports = loadArchServices;