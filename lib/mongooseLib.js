'use strict';

const mongoose = require('mongoose');
mongoose.Promise = Promise;

module.exports = {

  createConnection: function () {
    return new Promise ((resolve, reject) => {
      if (!CONFIG.MONGO_URL) {
        return reject('mongo setup detected, but no mongo url provided, please set the mongo url in the config file first.');
      }
      
      mongoose.connect(CONFIG.MONGO_URL);

      let db = mongoose.connection;
      db.on('error', err => {
        console.log('[ MONGO CONNECTION ]', err);
        reject(err);
      });
      db.once('open', () => {
        console.log(`Connected to MongoDB @ ${ CONFIG.MONGO_URL }`);
        resolve(db);
      });

    });
  }

};