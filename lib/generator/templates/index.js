'use strict';

const Hapi = require('hapi');
const HapiArch = require('hapi-arch');

const archPlugin = HapiArch({
  config: require('./.hapiarch.json')
});

const server = new Hapi.Server();

server.connection(CONFIG.connection);

let plugins = [archPlugin];
plugins = _.union(plugins, require('./thirdParty'));

/** register plugins then start the server. */
server.register(plugins, (err) => {

  if (err) throw err;

  // start the server connection.
  server.start((err) => {

    if (err) throw err;

    server.log('info', 'Server running at: ' + server.info.uri);

  });

});

module.exports = server;