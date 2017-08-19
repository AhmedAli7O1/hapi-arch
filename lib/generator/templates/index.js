'use strict';

const hapiArch = require('hapi-arch');
const ERROR_CODE = 1;

module.exports = hapiArch()

  // do whatever you need here with the server object.
  .then((server) => server)

  // on server fail to load.
  .catch((err) => {
    console.log(err);
    process.exit(ERROR_CODE);
  });