'use strict';

module.exports = function (server) {

  // params: server, options.
  const scheme = function () {
    return {
      api: { settings: { x: 5 } },
      authenticate: function (request, reply) {
        return reply.continue({ credentials: { user: 'john' } });
      }
    };
  };

  server.auth.scheme('custom', scheme);
  server.auth.strategy('default', 'custom');

};