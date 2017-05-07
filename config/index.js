"use strict";

/**
 * this module will load the local config
 * and the user provided config.
 * also user config will override the local once.
 */

const localConfig = require('./config.json');

module.exports = localConfig;