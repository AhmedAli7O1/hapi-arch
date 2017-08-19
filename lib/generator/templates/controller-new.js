'use strict';

module.exports = function (server, options, services) {

  const { UserService } = services;

  return {

    create: function (request, reply) {
      UserService.create(request.payload)
        .then((res) => reply(res))
        .catch((err) => reply(err));
    },

    find: function (request, reply) {
      UserService.find({})
        .then((res) => reply(res))
        .catch((err) => reply(err));
    }

  };

};