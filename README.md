# hapi-arch

[![NPM](https://nodei.co/npm/hapi-arch.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/hapi-arch/) 
[![NPM](https://nodei.co/npm-dl/hapi-arch.png?height=2)](https://nodei.co/npm/hapi-arch/)


mini framework for hapijs, using rails like convention.

[![Known Vulnerabilities](https://snyk.io/test/npm/hapi-arch/badge.svg)](https://snyk.io/test/npm/hapi-arch)

## Table of Contents
* [Introduction](#introduction)
* [Features](#features)
* [Usage](#usage)
    * [Generators](#generators)
* [Plugins](#plugins)
* [Methods](#methods)
* [Policies](#policies)
* [Models](#models)
* [Services](#services)
* [Controllers](#controllers)
* [Input Validation](#input-validation)
* [Routes](#routes)
* [Settings](#settings)
* [What is next](#what-is-next)

### Introduction 
Models, Services, Controllers and routes, without breaking the plugins architecture hapi uses.
 so you still can benefit from the microservices design by defining every single feature in your app as a plugin.
 
 however, you don't need to deal with the server structure every time you need add/remove a plugin.
  
  you just create a plugin folder with your business logic, controllers, services, models and routes, then restart your server...then you're DONE! now you can access your new APi end-points.

### Features
  * hapi plugins as well as MVC conventions.
  * mongoose support, just put your schema and use it directly from the services. 
  
### Usage

* generate new project.

```
# install hapi-arch globally
npm install -g hapi-arch

# generate a new app
hapi-arch generate new

# follow instructions

# go to the app directory
cd app-name

# install node dependencies
npm install

# you can start your app now by
npm start
```

now you have a fully working REST server, with or without mongo support.
you still have control over your server configuration in the `index.js`.

### Generators

##### available generators
    
```   
hapi-arch generate new
hapi-arch generate controller
hapi-arch generate model
hapi-arch generate service
hapi-arch generate policy
hapi-arch generate method
```    

### Plugins
a plugin is considered a new feature, you can add new plugin by creating new folder under `app/api`
  
  
### Methods
generic methods to use across all plugins.

PATH: `app/methods/TestMethod.js`

example: 
```
module.exports = function () {
  // code goes here
  return;
};
```
  
### Policies
middlewares to apply one or more policy on your routes.

PATH: `app/policies/hasJwt.js`

example: 
```
module.exports = function (request, reply) {
    // check JWT
  return;
};
```
  
### Models
mongoose models, to your DB models create new folder in your plugin folder and name it models, then add each model in a separate file, the file name will be the model/collection name, and inside the file export new mongoose Schema Object.

PATH: `app/api/[plugin path]/models/Test.js`

example:
```
const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
  name: String,
  age: Number 
});
``` 
  
### Services
where your bussiness logic goes.

PATH: `app/api/[plugin dir]/services/TestService.js`

example: 
```
module.exports = function (server, options, models, methods) {

  return {

    create: function (data) {
      return models.Test.create(data);
    }

  };

};
```
  
### Controllers
your API routes controllers.

PATH: `app/api/[plugin dir]/controllers/TestController.js`

example:
```
module.exports = function (server, options, services, methods) {

  return {

    create: function (request, reply) {

      services.TestService.create(request.payload);

    }

  };

};
```  
 
### Input Validation
input validation schema for using Joi

PATH: `app/api/[plugin dir]/schema/TestSchema.js`

example: 
```
const Joi = require('joi');

module.exports = {

  headers: Joi.object({
    'api-key': Joi.string().required()
      .description('Api Key of the api')
  }).options({allowUnknown:true}),

  payload: Joi.object({
    test: Joi.string().example('test').description('this is an example!')
  }).required()

};
```
  
### Routes
create routes for your API, and assign controllers methods, validation schema and methods.

PATH: `app/api/[plugin dir]/routes.js`

example: 
```
module.exports = function (controllers, schema, policies) {
  return [
    {
      method: 'POST',
      path: '/test',
      config: {
        handler: controllers.TestController.create,
        description: 'route description',
        tags: ['api'],
        validate: schema.TestSchema,
        pre: [{
          method: policies.hasJwt
        }]
      }
    }
  ];
};
```
  
### Settings
* to disable plugin without removing it, including its test cases and everything, just add the plugin name to the file ` .hapiarch.json ` in ` plugins.blacklist ` array.  

### What is next
I'm working on the documentation as well as more new features, please feel free to suggest or even help with your code (^_^)

I'm also looking to add swagger support and Lab testing, in a few days, maybe! 
Have Fun ;) 
