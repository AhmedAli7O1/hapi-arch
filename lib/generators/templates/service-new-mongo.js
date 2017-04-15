'use strict';

module.exports = function (server, options, models, methods) {

  return {

    create: function (data) {
      return models.User.create(data);
    },

    find: function (criteria) {
      return models.User.find(criteria);
    }

  };

};