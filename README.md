# Hapi Arch

[hapi](https://github.com/hapijs/hapi) Convention Control framework

[![npm](https://img.shields.io/npm/v/hapi-arch.svg)]()
[![npm](https://img.shields.io/npm/dt/hapi-arch.svg)]()
[![Libraries.io for GitHub](https://img.shields.io/librariesio/github/AhmedAli7O1/hapi-arch.svg)]()
[![Code Climate](https://img.shields.io/codeclimate/github/AhmedAli7O1/hapi-arch.svg)]()
[![Known Vulnerabilities](https://snyk.io/test/npm/hapi-arch/badge.svg)](https://snyk.io/test/npm/hapi-arch)

[v1 documentations](/README-V1.md)

## Table of Contents
* [Introduction](#introduction)
* [Features](#features)
* [Usage](#usage)
    * [Generators](#generators)
* [Plugins](#plugins)
* [Input Validation](#input-validation)
* [Routes](#routes)
* [Controllers](#controllers)
* [Services](#services)
* [Models](#models)
* [Settings](#settings)
    * [Plugins Blacklist](#Plugins-Blacklist)

### Introduction 

Hapi Arch is an CCF " Convention Control Framework " which make it easier to get up and running 
with a fully working hapi server using just one command.

Hapi Arch uses the following convention: <br> 
    `Route => Controller => Service => Mode or user defined component`
  
Hapi Arch is implementing the above convention without breaking the plugins based architecture provided by Hapi.
that means you can break your application down to small parts aka Plugins and for each plugin you get to build it 
using the above convention. and you'll end up building your Hapi Server in a Microservices style, 
as every plugin considered a separate Microservice.
  
### Features
  * generate a fully working hapi server using one command.
  * built in mongo & mongoose support.
  * break your application logic/features into smaller parts/services using hapi plugins.
  * in addition to controllers, services and models you can define your own components, 
  and then start using them directly within the services in the same plugin. 
  * you can defined your ArchPlugins to manipulate your components across all your plugins.   
  * you can defined your ArchServices to schedule tasks before bootstrapping the server e.g connect to mongo.
  * Joi input validation and auto generated swagger documentations.
  
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

### Generators

##### available generators
    
```   
hapi-arch generate new
hapi-arch generate plugin
hapi-arch generate controller
hapi-arch generate model
hapi-arch generate service
```    

### Plugins
Hapi provide you with a plugin system to be able to organize your app into small parts, 
you can add new plugin by creating new folder under `app/api`
or using the plugin generator `hapi-arch generate plugin`  
  
### Input Validation
input validation schema using Joi, to validate your routes inputs,
also it'll be used to generate swagger documentations.

PATH: `app/api/[plugin dir]/schema/PostSchema.js`

example: 
```javascript
const Joi = require('joi');
// Post Schema
module.exports = {
  headers: Joi.object({
    'api-key': Joi.string().required()
      .description('Api Key of the api')
  }).options({allowUnknown:true}),
  payload: Joi.object({
    name: Joi.string().example('test').description('your name'),
    age: Joi.number().example(20).description('your age')
  }).required()
};
```

usage: 
```javascript
// routes.js
module.exports = function (server, options, controllers, components) {
  const { UserController } = controllers;
  const { PostSchema } = components.schema;
  return [
    {
      method: "POST",
      path: "/pluginOne/user",
      config: {
        handler: UserController.create,
        description: "create new user",
        tags: ["api"],
        validate: PostSchema
      }
    }
  ];
};
```
  
### Routes
your api endpoints.
create routes for your API, and assign controllers and validation schema.

PATH: `app/api/[plugin dir]/routes.js`

example: 
```javascript
// routes.js
module.exports = function (server, options, controllers, components) {

  const { UserController } = controllers;
  const { GetSchema } = components.schema;
  const { PostSchema } = components.schema;

  return [
    {
      method: "GET",
      path: "/pluginOne/user",
      config: {
        handler: UserController.find,
        description: "find all users",
        tags: ["api"],
        validate: GetSchema
      }
    },
    {
      method: "POST",
      path: "/pluginOne/user",
      config: {
        handler: UserController.create,
        description: "create new user",
        tags: ["api"],
        validate: PostSchema
      }
    }
  ];
};
```

### Controllers
Controllers contains the handlers/actions/functions which we bind to each route.

Controllers mainly control the flow of the request, so it receives the user request,
and ask services to do the business logic and then return the end result to the user.

Controllers do not directly call models or other controllers, 
instead it just control the flow. but services does this.

PATH: `app/api/[plugin dir]/controllers/UserController.js`

example:
```javascript
// Test Controller
module.exports = function (server, options, services) {
  const { TestService } = services;
  const { UserService } = services;
  return {
    create: function (request, reply) {
      UserService.validate(request.payload)
        .then(user => UserService.create(user))
        .then(user => TestService.test(user))
        .then(res => reply(res))
        .catch(err => reply(err));
    },
    find: function (request, reply) {
      UserService.find({})
        .then(res => reply(res))
        .catch(err => reply(err));
    }
  };
};
```  

usage: 
```javascript
module.exports = function (server, options, controllers, components) {

  const { UserController } = controllers;
  const { GetSchema } = components.schema;
  const { PostSchema } = components.schema;

  return [
    {
      method: "GET",
      path: "/pluginOne/user",
      config: {
        handler: UserController.find,
        description: "find all users",
        tags: ["api"],
        validate: GetSchema
      }
    },
    {
      method: "POST",
      path: "/pluginOne/user",
      config: {
        handler: UserController.create,
        description: "create new user",
        tags: ["api"],
        validate: PostSchema
      }
    }
  ];
};
```

### Services
Services is the place where your business logic go,
a Service should be able to take care of the business logic for one unit,
in your app, i.e a User Service could provide us with a create, find, update and delete
functions to deal with the user accounts.

Services normally should be used inside Controllers, they should not talk to each others,
as services better be stateless, if you modified a service code this should not affect
any other service.

inside services you can use both predefined components e.g models or user defined components.

PATH: `app/api/[plugin dir]/services/TestService.js`

example: 
```javascript
const co = require("co");
// Test Service
module.exports = function (server, options, components) {
  const { Test } = components.models;
  const { FirstApi } = components.myapis;
  return {
    find: function (criteria) {
      return co(function* () {
        const data = yield Test.find(criteria);
        if (data) {
          return FirstApi.get(data);
        }
      });
    }
  };
};
```

usage:
```javascript
// Test Controller
module.exports = function (server, options, services) {
  const { TestService } = services;
  return {
    find: function (request, reply) {
      TestService.find({}).then(reply).catch(reply);
    }
  };
};
```

### Models
Models is a predefined Arch Component that by default includes your DB Schema/ORM implementation.
if you choose to include mongoose support you'll be provided a folder called models, 
to put all your MongoDB models, but still you can create this folder yourself and put your preferred DB Schema
or ORM implementation, and then you can use it directly from services via the components parameter, and if your schema
requires any modifications before it'll be ready, you can do so by creating an ArchPlugin which targets your Component.

PATH: `app/api/[plugin path]/models/Test.js`

example:
```javascript
const mongoose = require('mongoose');
// here we exports mongoose schema.
module.exports = new mongoose.Schema({
  name: String,
  age: Number 
});
```  
  
usage: how to call it from a service 
```javascript
// Test Service
module.exports = function (server, options, components) {
  const { Test } = components.models;
  return {
    find: function (criteria) {
      // the model name is the same as the file name.
      return Test.find(criteria);
    }
  };
};
```
  
### Settings
`arch.json` is the place to put your arch configuration.

you can configure the following:

#### Plugins Blacklist
* usage: `plugins.blacklist {Array}`
* description: add one or more plugins name to disable this plugin from starting.
