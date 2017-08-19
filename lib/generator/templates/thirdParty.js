'use strict';

const Good = require('good');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package.json');

/** define third party plugins */
const plugins = [
  {
    register: Good,
    options: {
      reporters: {
        console: [
          {
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{
              response: '*',
              log: '*'
            }]
          },
          { module: 'good-console' },
          'stdout'
        ]
      }
    }
  },
  Inert,
  Vision,
  {
    'register': HapiSwagger,
    'options': {
      info: {
        title: Pack.title,
        version: Pack.version
      }
    }
  }
];

module.exports = plugins;