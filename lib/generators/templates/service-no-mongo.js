'use strict';

module.exports = function (server, options, models, methods) {

  return {

    create: function (data) {
      return Promise.resolve(data);
    },

    find: function (criteria) {
      return Promise.resolve({ name: 'Hapi', age: 1 });
    }

  };

};