"use strict";

const archFs = require("../archFs");
const archLog = require("../archLog");
const APP = require("../text/app.json");
const locations = require("../locations");
const archError = require("../errors")(APP.ARCH_SERVICE);
const { forEach } = require("lodash");
const ArchService = require("./ArchService");

function loadService (serviceName) {
  try {

    /*
      - first check the user defined services.
      - second check if it's built in module.
     */

    const localPath = archFs.join(__dirname, serviceName) + ".js";
    const userPath = archFs.join(locations.ARCH_SERVICES, serviceName) + ".js";

    if (archFs.exist(userPath)) {
      return archFs.load(userPath);
    }
    else if (archFs.exist(localPath)) {
      return archFs.load(localPath);
    }
    else {
      archLog.error(archError(`service ${serviceName} not found!`));
    }

  }
  catch (err) {
    archLog.error(archError(err));
  }
}

function loadArchServices (archServicesList, appConfig) {
  return new Promise((resolve) => {

    if (!archServicesList && !archServicesList.length) {
      return resolve();
    }

    let loadedServices = [];

    forEach(archServicesList, serviceName => {
      const loadedService = loadService(serviceName);
      if (loadedService) {
        try {
          const archService = new ArchService(loadedService);
          loadedServices.push(archService.exec(appConfig));
        }
        catch (err) {
          archLog.error(archError(err));
        }
      }
    });

    Promise.all(loadedServices)
      .then(resolve)
      .catch(err => {
        archLog.error(archError(err));
        process.exit(1);
      });

  });
}

module.exports = loadArchServices;