'use strict';

module.exports = function (server, options, components) {

  const { User } = components.models;

  return {

    create: function (data) {
      return User.create(data);
    },

    find: function (criteria) {
      return User.find(criteria);
    }

  };

};