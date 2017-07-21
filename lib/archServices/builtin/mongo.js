"use strict";

/*
  Mongoose ArchService
  ver 1.0.0
 */

const archLog = require("../../archLog");
const mongoose = require("mongoose");
mongoose.Promise = Promise;

function handler ({ url, options }) {

  return new Promise ((resolve, reject) => {

    if (!url) {
      return reject("mongo url not found!");
    }

    mongoose.connect(url, options);

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
  requireConfig: true,
  handler: handler
};
