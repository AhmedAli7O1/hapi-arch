'use strict';

module.exports = function (server, options, controllers, components) {

  const { UserController } = controllers;
  const { GetSchema } = components.schema;
  const { PostSchema } = components.schema;

  return [
    {
      method: 'GET',
      path: '/pluginOne/user',
      config: {
        handler: UserController.find,
        description: 'find all users',
        tags: ['api'],
        validate: GetSchema
      }
    },
    {
      method: 'POST',
      path: '/pluginOne/user',
      config: {
        handler: UserController.create,
        description: 'create new user',
        tags: ['api'],
        validate: PostSchema
      }
    }
  ];
};