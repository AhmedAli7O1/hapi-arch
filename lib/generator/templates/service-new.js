'use strict';

module.exports = function () {

  return {

    create: function (data) {
      return Promise.resolve(data);
    },

    find: function () {
      return Promise.resolve({ name: 'hapi', age: 1 });
    }

  };

};