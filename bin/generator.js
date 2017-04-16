const path = require('path');
const co = require('co');
const prompt = require('co-prompt');
const os = require('os');
const _ = require('lodash');
const generators = require('../lib/generators');
const archLog = require('../lib/archLog');
const pkg = require('../package.json');
const isExist = require('../lib/isExist');
const getPath = require('../lib/getPath');
const archConfig = require('../lib/archConfig')();

module.exports = function (mode) {
  switch (mode) {
    case 'new':
      genNew();
      break;
    case 'controller':
      genController();
      break;
    case 'service':
      genService();
      break;
    case 'model':
      genModel();
      break;
    case 'policy':
      genPolicy();
      break;
    case 'method':
      genMethod();
      break;
    default:
      archLog.error(`generator type ${mode} not supported!`);
      break;
  }
};

function genNew () {

  // take the user input.
  co(function *() {

    let appName = '',
        version = '1.0.0',
        description = 'hapi server',
        author = os.userInfo().username;

    while (appName.length < 1) {
      appName = yield prompt('enter the app name: ');
      if (appName.length > 1) {
        appName = appName.toLowerCase();
        appName = appName.replace(' ', '-');
        let ans = yield prompt(`your app name will be ${appName} is that okay? (y): `);
        if (ans.toLowerCase() !== 'y') appName = '';
      }
    }

    let promptDescription = yield prompt('enter the app description: ');
    let promptVersion = yield prompt('enter the app version (default 1.0.0) : ');
    let promptAuthor = yield prompt(`enter the app author (default ${author}) : `) || author;
    let mongo = yield prompt('do you want to include mongodb support using mongoose? (y) : ');

    const appPkg = {
      name: appName,
      version: promptVersion || version,
      description: promptDescription || description,
      author: promptAuthor || author,
      dependencies: {
        "hapi": "*",
        "good": "*",
        "good-squeeze": "*",
        "good-console": "*",
        "inert": "*",
        "vision": "*",
        "hapi-swagger": "*",
        "hapi-arch": `^${pkg.version}`
      },
      scripts: {
        start: "node index.js"
      },
    };

    // check if the user want to add mongoose.
    if (mongo === 'y') appPkg.dependencies['mongoose'] = '*';

    console.log(JSON.stringify(appPkg, null, 2));
    let ans = yield prompt('this is your package.json file looks like, is that okay? (y) : ');


    if (ans !== 'y') {
      archLog.error('app creation canceled!');
      process.exit(0);
    }

    // generate the app structure.
    const schema = [
      {
        type: 'folder',
        name: appName,
        sub: [
          {
            type: 'json',
            name: 'package',
            data: appPkg
          },
          {
            type: 'folder',
            name: 'config',
            sub: [
              {
                type: 'folder',
                name: 'env',
                sub: [
                  {
                    type: 'config',
                    name: 'development.js'
                  },
                  {
                    type: 'config',
                    name: 'production.js'
                  },
                  {
                    type: 'config',
                    name: 'staging.js'
                  },
                  {
                    type: 'config',
                    name: 'test.js'
                  }
                ]
              }
            ]
          },
          {
            type: 'folder',
            name: 'app',
            sub: [
              {
                type: 'folder',
                name: 'api',
                sub: [
                  {
                    type: 'folder',
                    name: 'pluginOne',
                    sub: [
                      {
                        type: 'folder',
                        name: 'controllers',
                        sub: [
                          {
                            type: 'controller',
                            name: 'UserController.js',
                            template: 'controller-new.js'
                          }
                        ]
                      },
                      {
                        type: 'folder',
                        name: 'models',
                        disabled: mongo !== 'y',
                        sub: [
                          {
                            type: 'model',
                            name: 'User.js',
                            template: 'model-new.js'
                          }
                        ]
                      },
                      {
                        type: 'folder',
                        name: 'schema',
                        sub: [
                          {
                            type: 'schema',
                            name: 'GetSchema.js'
                          },
                          {
                            type: 'schema',
                            name: 'PostSchema.js'
                          }
                        ]
                      },
                      {
                        type: 'folder',
                        name: 'services',
                        sub: [
                          {
                            type: 'service',
                            name: 'UserService.js',
                            template: mongo === 'y' ? 'service-new-mongo.js' : 'service-new.js'
                          }
                        ]
                      },
                      {
                        type: 'routes',
                        name: 'routes.js'
                      }
                    ]
                  }
                ]
              },
              {
                type: 'folder',
                name: 'methods'
              },
              {
                type: 'folder',
                name: 'policies'
              }
            ]
          },
          {
            type: 'json',
            name: '.hapiarch',
            data: {
              "plugins": {
                "blacklist": [
                  "pluginName"
                ]
              },
              "options": {
                "MongoDB": mongo === 'y'
              }
            }
          },
          {
            type: 'index',
            name: 'index.js'
          },
          {
            type: 'thirdParty',
            name: 'thirdParty.js'
          }
        ]
      }
    ];

    generators.generateSchema(process.cwd(), schema);

    process.exit(0);

  });

}

function genController () {
  co(function *() {

    // read the plugin name
    let pluginName = yield askPluginNameToGen();

    let ctrlName = '';

    // read the controller name
    while (ctrlName.length < 1) {
      ctrlName = yield prompt('enter the controller name : ');
      if (ctrlName && isExist('controller', pluginName, ctrlName)){
        archLog.error(`controller with name ${ctrlName} is already exist`);
        ctrlName = '';
      }
    }

    // create the controller.
    generators.generate({
      location: getPath('controllers', pluginName),
      name: ctrlName + '.js',
      type: 'controller'
    });

    process.exit(0);

  });
}

function genService () {
  co(function *() {

    let pluginName = yield askPluginNameToGen();

    let serviceName = '';

    // read the service name
    while (serviceName.length < 1) {
      serviceName = yield prompt('enter the service name : ');
      if (serviceName && isExist('service', pluginName, serviceName)){
        archLog.error(`service with name ${serviceName} is already exist`);
        serviceName = '';
      }
    }

console.log(getPath('services', pluginName));
    // create the service.
    generators.generate({
      location: getPath('services', pluginName),
      name: serviceName + '.js',
      type: 'service'
    });


    process.exit(0);

  });
}

function genModel () {
  co(function *() {

    let mongoEnabled = _.get(archConfig, 'options.MongoDB');

    if (!mongoEnabled) {
      archLog.error('sorry, mongoose support is disabled!');
      process.exit(1);
    }

    let pluginName = yield askPluginNameToGen();

    let modelName = '';

    // read the model name
    while (modelName.length < 1) {
      modelName = yield prompt('enter the model name : ');
      if (modelName && isExist('model', pluginName, modelName)){
        archLog.error(`model with name ${modelName} is already exist`);
        modelName = '';
      }
    }

    // create the model.
    generators.generate({
      location: getPath('models', pluginName),
      name: modelName + '.js',
      type: 'model'
    });

    process.exit(0);

  });
}

function genPolicy () {
  co(function *() {

    let policyName = '';

    // read the policy name
    while (policyName.length < 1) {
      policyName = yield prompt('enter the policy name : ');
      if (policyName && isExist('policy', null, policyName)){
        archLog.error(`policy with name ${policyName} is already exist`);
        policyName = '';
      }
    }

    // create the policy.
    generators.generate({
      location: getPath('policies'),
      name: policyName + '.js',
      type: 'policy'
    });

    process.exit(0);

  });
}

function genMethod () {
  co(function *() {

    let methodName = '';

    // read the method name
    while (methodName.length < 1) {
      methodName = yield prompt('enter the method name : ');
      if (methodName && isExist('method', null, methodName)){
        archLog.error(`method with name ${methodName} is already exist`);
        methodName = '';
      }
    }

    // create the method.
    generators.generate({
      location: getPath('methods'),
      name: methodName + '.js',
      type: 'method'
    });

    process.exit(0);

  });
}

function askPluginNameToGen () {
  return co(function *() {

    let pluginName = '';

    // read the plugin name
    while (pluginName.length < 1) {
      pluginName = yield prompt('enter the plugin name : ');
      // check if the entered plugin is exist.
      if (pluginName && !isExist('plugin', pluginName)) {
        archLog.error(`no plugins found with the name ${pluginName}`);
        pluginName = '';
      }
    }

    return pluginName;

  });
}