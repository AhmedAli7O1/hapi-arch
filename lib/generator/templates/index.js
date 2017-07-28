"use strict";

const HapiArch = require("hapi-arch");

module.exports = HapiArch()

  // do whatever you need here with the server object.
  .then(server => {
    return server;
  })

  // on server fail to load.
  .catch(error => {
    process.exit(1);
  });