module.exports = function (controllers, schema) {
  return [
    {
      method: 'GET',
      path: '/pluginOne/user',
      config: {
        handler: controllers.UserController.find,
        description: 'find all users',
        tags: ['api'],
        validate: schema.GetSchema
      }
    },
    {
      method: 'POST',
      path: '/pluginOne/user',
      config: {
        handler: controllers.UserController.create,
        description: 'create new user',
        tags: ['api'],
        validate: schema.PostSchema
      }
    }
  ];
};