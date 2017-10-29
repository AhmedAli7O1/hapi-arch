'use strict';

const _ = require('lodash');

/**
 * convert an array to key - value object
 * @param {object[]} array of objects to convert
 * @param {string} key name of the attribute that will be used as key
 * @param {string} value name of the attribute that will be used as the value
 * @returns {object} converted object
 */
function arrayToObject (array, key, value) {
  const obj = {};

  _.forEach(array, (item) => {
    obj[item[key]] = item[value];
  });

  return obj;
}

module.exports = { arrayToObject };
