"use strict";

/*
  Mongoose ArchService
  ver 1.0.0
 */

const archLog = require("../archLog");
const mongoose = require("mongoose");
mongoose.Promise = Promise;

function handler (config) {
  return new Promise ((resolve, reject) => {

    if (!config.url) {
      return reject("mongo url not found!");
    }

    mongoose.connect(config.url);

    let db = mongoose.connection;
    db.on("error", err => {
      return reject(err);
    });

    db.once("open", () => {
      archLog.info("Connected To MongoDB");
      return resolve(db);
    });

  });
}

module.exports = {
  name: "mongo",
  requireConfig: true,
  handler: handler
};
