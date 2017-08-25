'use strict';

/*
  Mongoose ArchService
  ver 1.0.0
 */

const archLog = require('../../archLog');
const mongoose = require('mongoose');
mongoose.Promise = Promise;

const handler = function ({ url, options }) {

  return new Promise ((resolve, reject) => {

    if (!url) {
      return reject(new Error('mongo url not found!'));
    }

    mongoose.connect(url, options);

    const db = mongoose.connection;
    db.on('error', (err) => reject(err));

    db.once('open', () => {
      archLog.info('Connected To MongoDB');
      return resolve(db);
    });

  });
};

module.exports = {
  requireConfig: true,
  handler: handler
};
