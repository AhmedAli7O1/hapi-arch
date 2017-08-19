'use strict';

/**
 * this module will load the local config
 * and the user provided config.
 * also user config will override the local once.
 */

const _ = require('lodash');
const localConfig = require('./config.json');
const userConfig = require('./userConfig');

_.merge(localConfig, userConfig);

module.exports = localConfig;