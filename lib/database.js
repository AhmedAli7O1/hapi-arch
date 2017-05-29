"use strict";

const mongoose = require("mongoose");
mongoose.Promise = Promise;

module.exports = function (config) {
  return new Promise ((resolve, reject) => {

    if (!config.mongoose) {
      return resolve();
    }

    if (!config.mongoose.url) {
      return reject("mongo url not found!");
    }

    mongoose.connect(config.mongoose.url);

    let db = mongoose.connection;
    db.on("error", err => {
      return reject(err);
    });

    db.once("open", () => {
      return resolve(db);
    });

  });
};
