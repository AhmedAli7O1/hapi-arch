'use strict';

const config = require('../config');
const _ = require('lodash');
const Lab = require('lab');

let labConfig = CONFIG.lab;

// default lab config.
labConfig = labConfig || { globals: [] };

if (!_.isArray(labConfig.globals)) {
  labConfig.globals = [labConfig.globals];
}

labConfig.globals = _.union(labConfig.globals, config.globals);

const lab = Lab.script(labConfig);

_.forEach(TEST, (plugin) => {
  _.forEach(plugin, (test) => {
    test(lab);
  });
});