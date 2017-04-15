'use strict';

module.exports = function (server, options, services, methods) {

  return {

    create: function (request, reply) {
      services.UserService.create(request.payload)
        .then(res => reply(res))
        .catch(err => reply(err));
    },

    find: function (request, reply) {
      services.UserService.find({})
        .then(res => reply(res))
        .catch(err => reply(err));
    }

  };

};