'use strict';

const _ = require('lodash');

function arrayToObject (array, key, value) {
  const obj = {};

  _.forEach(array, item => {
    obj[item[key]] = item[value]
  });

  return obj;

}