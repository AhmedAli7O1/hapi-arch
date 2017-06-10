"use strict";

const APP = require("./text/app.json");
const _ = require("lodash");

module.exports = _.curry(function (type, err) {
  return `${type} ${APP.ERROR_TITLE} ${err}`;
});