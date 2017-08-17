# Hapi Arch

[hapi](https://github.com/hapijs/hapi) Convention Control framework

[![Build Status](https://travis-ci.org/AhmedAli7O1/hapi-arch.svg?branch=master)](https://travis-ci.org/AhmedAli7O1/hapi-arch)
[![npm](https://img.shields.io/npm/v/hapi-arch.svg)]()
[![npm](https://img.shields.io/npm/dt/hapi-arch.svg)]()
[![Libraries.io for GitHub](https://img.shields.io/librariesio/github/AhmedAli7O1/hapi-arch.svg)]()
[![Code Climate](https://img.shields.io/codeclimate/github/AhmedAli7O1/hapi-arch.svg)]()
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/6504095b7b6547e88d8bb06c0001104a)](https://www.codacy.com/app/AhmedAli7O1/hapi-arch?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=AhmedAli7O1/hapi-arch&amp;utm_campaign=Badge_Grade)
[![Known Vulnerabilities](https://snyk.io/test/npm/hapi-arch/badge.svg)](https://snyk.io/test/npm/hapi-arch)

[v1 documentations](/README-V1.md)

## Table of Contents
* [Introduction](#introduction)
* [Features](#features)
* [Usage](#usage)
* [Plugins](#plugins)
* [Input Validation](#input-validation)
* [Routes](#routes)
* [Controllers](#controllers)
* [Services](#services)
* [Models](#models)
* [Components](#components)
* [ArchServices](#archservices)
* [ArchPlugins](#archplugins)
* [Settings](#settings)

<hr>

### Introduction 

Hapi Arch is an CCF " Convention Control Framework " which make it easier to get up and running 
with a fully working hapi server using just one command.

Hapi Arch uses the following convention: <br> 
    `Route => Controller => Service => Model or user defined component`
  
Hapi Arch is implementing the above convention without breaking the plugins based architecture provided by Hapi.
that means you can break your application down to small parts aka Plugins and for each plugin you get to build it 
using the above convention. and you'll end up building your Hapi Server in a Microservices style, 
as every plugin considered a separate Microservice.

<hr>
  
### Features
  * generate a fully working hapi server using one command.
  * built in mongo & mongoose support.
  * break your application logic/features into smaller parts/services using hapi plugins.
  * in addition to controllers, services and models you can define your own components, 
  and then start using them directly within the services in the same plugin. 
  * you can defined your ArchPlugins to manipulate your components across all your plugins.   
  * you can defined your ArchServices to schedule tasks before bootstrapping the server e.g connect to mongo.
  * Joi input validation and auto generated swagger documentations.
  * environment specific configurations.

<hr>
  
### Usage

* generate new project.

```bash
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

<hr>

### Generators
##### available generators
    
```bash
hapi-arch generate new
hapi-arch generate plugin
hapi-arch generate controller
hapi-arch generate model
hapi-arch generate service
```    

<hr>

### Plugins
Hapi provide you with a plugin system to be able to organize your app into small parts, 
you can add new plugin by creating new folder under `app/api`
or using the plugin generator `hapi-arch generate plugin`  

<hr>
  
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
<hr>
  
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

<hr>

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

<hr>

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

<hr>

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

<hr>

### Components

a component is actually any builtin or user defined set of modules other than 
" controllers and services " e.g schema and models folders in each plugin is actually
components.

#### Use Case
simply if you can use components to define any part of your logic that 
does not fit in either controllers or services.

### Usage
you can simply create a new folder in your plugin directory, name it whatever you like to,
and then you can start writing your modules in side this folder, each module should 
just export an object with your exposed functions.

this folder will be a new component and ready for you to use from your services
under the components parameter with the folder name.

example
```javascript
/**
* location: app/api/[plugin path]/mycomponent/TestComp.js
*/
module.exports = {
  printWelcome: function () {
    return "Hello from your new Component";
  }
};
```

usage: example of how to call your component within a service.
```javascript
/**
* location: app/api/[plugin path]/services/TestService.js
*/
module.exports = function (server, options, components) {
  const { TestComp } = components.mycomponent;
  return {
    print: function () {
      TestComp.printWelcome();
    }
  };
};
```
  
<hr>
  
### ArchServices
ArchService is simply a set of built-in and user defined scripts which run only once before starting
your hapi server.

#### Use Case
a simple use case for ArchService is the DataBase setup and Connection, so for example
you could create a script which setup and connect to your MongoDB before starting the server.
NOTE: there is a built-in ArchService for Mongo Connection, that do exactly just this.

#### Builtin ArchServices
* mongo: an ArchService that uses your environment configuration to connect to your
mongo server.

#### User Defined ArchServices
you can place your ArchServices in the folder `/archServices`

<b>usage :</b> the following example using the mongo server connection ArchService.
the ArchService consist of two parts.

* handler function: which takes the ArchService Configuration as a parameter
and then return promise. note you can put your configurations in the environment 
config files with the same name as the ArchService, so in this case we need
to create a config file inside the main config folder or any environment specific 
config folder e.g production, staging etc. 
`/config/mongo.js` or `/config/production/mongo.js`
* service initialization : at the end of the file you need to export Object
with just two parameters, the handler function and a flag to indicate if this 
service requires config, which if you set to true, the server won't start
if you didn't provide it with a config file with this ArchService Name.
     

```javascript
const mongoose = require("mongoose");

/**
* name: mongo.js
* path: /archServices/mongo.js
* the handler function takes the environment configurations
* for this ArchService.
* NOTE: the configurations should have the same name as the ArchService.
*/
function handler (config) {
  // you should always return promise.
  return new Promise ((resolve, reject) => {

    if (!config.url) {
      return reject("mongo url not found!");
    }

    mongoose.connect(config.url);

    let db = mongoose.connection;
    db.on("error", err => {
      return reject(err);
    });

    db.once("open", () => {
      console.log("Connected To MongoDB");
      return resolve(db);
    });

  });
}

module.exports = {
  requireConfig: true,
  handler: handler
};

```

<hr>
  
### ArchPlugins
ArchPlugins is simply a set of built-in and user defined scripts which runs only once
on a targeted component in each <b>App Plugin</b>.
  
#### Use Case
one simple use case for ArchPlugins is the builtin ArchPlugin mongoose, which targets
the component models, because models folder is considered a component, Hapi Arch
won't manipulate the content of this folder, by default it'll just load it's content 
and inject them into your services, but that won't work with mongoose, because in models
we just exporting the `Mongoose Schema` but before we can use them we need to manipulate
those schema files replace them with mongoose schema, and that actually what the 
builtin mongoose ArchPlugin does, it targets the models so it'll convert the exported 
schema in each plugin to mongoose model.

that means you can use ArchPlugin to decorate/manipulate builtin or user defined components
in all the plugins. 

#### Builtin ArchPlugins
* mongoose: an ArchPlugins that convert you mongoose schema in the model folder to 
mongoose models before making them available from your services.

#### User Defined ArchPlugins
you can place your ArchPlugins in the folder `/archPlugins`

<b>usage :</b> the following example using the mongoose ArchPlugin.
the ArchPlugin consist of two parts.

* handler function: which takes the targeted component as a parameter
and then return promise. 
* plugin initialization : at the end of the file you need to export Object
with just two parameters, the handler function and a target component name, 
which will be determined in the run-time and passed to your handler as a parameter.
  
```javascript
/**
* location: /archPlugins/mongoose.js
*/
const { keys, forEach } = require("lodash");
const mongoose = require("mongoose");
mongoose.Promise = Promise;

function handler (component) {
  return new Promise ((resolve) => {
    // create models.
    forEach(keys(component), key => {
      component[key] = mongoose.model(key, component[key]);
    });
    return resolve(component);
  });
}

module.exports = {
  target: "models",
  handler: handler
};
```
  
<hr>  
  
### Settings
`arch.json` is the place to put your arch configuration.

#### Available Configurations
##### Plugins Blacklist
* usage: `plugins.blacklist {Array}`
* description: add one or more plugins name to disable this plugin from starting.


### Style Guide
[hapijs coding style guide](https://hapijs.com/styleguide) 
