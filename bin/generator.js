const fs = require('fs');
const path = require('path');
const co = require('co');
const prompt = require('co-prompt');
const os = require('os');
const archLog = require('../lib/archLog');
const archFs = require('../lib/archFs');
const pkg = require('../package.json');
const isExist = require('../lib/isExist');
const getPath = require('../lib/getPath');
const locations = require('../lib/locations');
const pkgVer = require('./pkgVer.json');
const Generator = require('../lib/generator');
const generator = new Generator();

/* eslint no-magic-numbers: "off" */

const generate = function (data) {
  try {
    generator.generate(data);
  }
  catch (e) {
    archLog.error(e);
    process.exit(1);
  }
};

const askPluginNameToGen = function () {
  return co(function* () {
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
};

const genNew = function () {
  // take the user input.
  co(function* () {
    let appName = '';
    const version = '1.0.0';
    const description = 'hapi server';
    const author = os.userInfo().username;

    while (appName.length < 1) {
      appName = yield prompt('enter the app name: ');
      if (appName.length > 1) {
        appName = appName.toLowerCase();
        appName = appName.replace(' ', '-');
        const ans = yield prompt(
          `your app name will be ${appName} is that okay? (y): `
        );
        if (ans.toLowerCase() !== 'y') {
          appName = '';
        }
      }
    }

    const promptDescription = yield prompt('enter the app description: ');
    const promptVersion = yield prompt(
      'enter the app version (default 1.0.0) : '
    );
    const promptAuthor = yield prompt(
      `enter the app author (default ${author}) : `
    ) || author;
    const mongo = yield prompt(
      'do you want to include mongodb support using mongoose? (y/n) default to n : '
    );
    let existingMongo = null;
    if (mongo === 'y') {
      existingMongo = yield prompt(
        'do you have existing mongodb database? (y/n) default to n : '
      );
      yield prompt(
        'since you chosen to include mongoose support, you should setup a mongo instance before starting the server. (press enter)'
      );
    }

    const appPkg = {
      name: appName,
      version: promptVersion || version,
      description: promptDescription || description,
      author: promptAuthor || author,
      dependencies: {
        'hapi': pkgVer.hapi,
        'good': pkgVer.good,
        'good-squeeze': pkgVer.goodSqueeze,
        'good-console': pkgVer.goodConsole,
        'inert': pkgVer.inert,
        'lodash': pkgVer.lodash,
        'moment': pkgVer.moment,
        'vision': pkgVer.vision,
        'hapi-swagger': pkgVer.hapiSwagger,
        'lab': pkgVer.lab,
        'hapi-arch': `^${pkg.version}`
      },
      scripts: {
        start: 'node index.js',
        test: 'node index.js --env=test'
      }
    };

    // check if the user want to add mongoose.
    if (mongo === 'y') {
      appPkg.dependencies['mongoose'] = pkgVer.mongoose;
    }

    archLog.info(JSON.stringify(appPkg, null, 2));
    const ans = yield prompt(
      'this is your package.json file looks like, is that okay? (y) : '
    );

    if (ans !== 'y') {
      archLog.error('app creation canceled!');
      process.exit(0);
    }

    // generate the app structure.
    const schema = {
      type: 'folder',
      name: appName,
      location: process.cwd(),
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
              name: 'development'
            },
            {
              type: 'folder',
              name: 'staging'
            },
            {
              type: 'folder',
              name: 'production'
            },
            {
              type: 'folder',
              name: 'test'
            },
            {
              type: 'file',
              name: 'connection',
              template: 'connection'
            },
            {
              type: 'file',
              name: 'mongo',
              template: existingMongo === 'y' ? 'mongo' : 'mongo-new'
            },
            {
              type: 'file',
              name: 'crontask',
              template: 'crontask-config'
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
                          type: 'file',
                          name: 'UserController',
                          template: 'controller-new'
                        }
                      ]
                    },
                    {
                      type: 'folder',
                      name: 'crontasks',
                      sub: [
                        {
                          type: 'file',
                          name: 'TestCron',
                          template: 'crontask'
                        }
                      ]
                    },
                    {
                      type: 'folder',
                      name: 'models',
                      disabled: mongo !== 'y',
                      sub: [
                        {
                          type: 'file',
                          name: 'User',
                          template: 'model-new'
                        }
                      ]
                    },
                    {
                      type: 'folder',
                      name: 'schema',
                      sub: [
                        {
                          type: 'file',
                          name: 'GetSchema',
                          template: 'schema'
                        },
                        {
                          type: 'file',
                          name: 'PostSchema',
                          template: 'schema'
                        }
                      ]
                    },
                    {
                      type: 'folder',
                      name: 'services',
                      sub: [
                        {
                          type: 'file',
                          name: 'UserService',
                          template:
                            mongo === 'y' ? 'service-new-mongo' : 'service-new'
                        }
                      ]
                    },
                    {
                      type: 'file',
                      name: 'routes',
                      template: 'routes'
                    },
                    {
                      type: 'folder',
                      name: 'test',
                      sub: [
                        {
                          type: 'file',
                          name: 'user.spec',
                          template: 'test-new'
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              type: 'folder',
              name: 'strategies',
              sub: [
                {
                  type: 'file',
                  name: 'apiKey',
                  template: 'strategy'
                }
              ]
            }
          ]
        },
        {
          type: 'json',
          name: 'arch',
          data: {
            plugins: { blacklist: ['pluginName'] },
            archServices: mongo === 'y' ? ['mongo'] : [],
            archPlugins: mongo === 'y' ? ['mongoose'] : []
          }
        },
        {
          type: 'file',
          name: 'index',
          template: 'index'
        },
        {
          type: 'file',
          name: 'thirdParty',
          template: 'thirdParty'
        },
        {
          type: 'file',
          name: 'bootstrap',
          template: 'bootstrap'
        },
        {
          type: 'yml',
          name: '.eslintrc',
          template: '.eslintrc'
        },
        {
          type: 'folder',
          name: 'archServices'
        },
        {
          type: 'folder',
          name: 'archPlugins'
        }
      ]
    };

    generate(schema);

    archLog.hint(`Done! now >> cd ${appName} && npm install`);

    process.exit(0);
  });
};

const genPlugin = function () {
  co(function* () {
    let pluginName = '';

    // read the plugin name
    while (pluginName.length < 1) {
      pluginName = yield prompt('enter the plugin name : ');
      // check if the entered plugin is exist.
      if (pluginName && isExist('plugin', pluginName)) {
        archLog.error(`plugin found with the name ${pluginName}`);
        pluginName = '';
      }
    }

    const mongo = yield prompt(
      'do you want to include mongodb support using mongoose? (y) : '
    );

    if (mongo === 'y') {
      yield prompt(
        'since you chosen to include mongoose support, you should setup a mongo instance before starting the server. (press enter)'
      );
    }

    const schema = {
      type: 'folder',
      name: pluginName,
      location: path.join(locations.APP_MIN_DIR, 'app', 'api'),
      sub: [
        {
          type: 'folder',
          name: 'controllers',
          sub: [
            {
              type: 'file',
              name: 'UserController',
              template: 'controller-new'
            }
          ]
        },
        {
          type: 'folder',
          name: 'crontasks',
          sub: [
            {
              type: 'file',
              name: 'TestCron',
              template: 'crontask'
            }
          ]
        },
        {
          type: 'folder',
          name: 'models',
          disabled: mongo !== 'y',
          sub: [
            {
              type: 'file',
              name: 'User',
              template: 'model-new'
            }
          ]
        },
        {
          type: 'folder',
          name: 'schema',
          sub: [
            {
              type: 'file',
              name: 'GetSchema',
              template: 'schema'
            },
            {
              type: 'file',
              name: 'PostSchema',
              template: 'schema'
            }
          ]
        },
        {
          type: 'folder',
          name: 'services',
          sub: [
            {
              type: 'file',
              name: 'UserService',
              template: mongo === 'y' ? 'service-new-mongo' : 'service-new'
            }
          ]
        },
        {
          type: 'file',
          name: 'routes',
          template: 'routes'
        }
      ]
    };

    generate(schema);

    archLog.hint('Done!');

    process.exit(0);
  });
};

const genController = function () {
  co(function* () {
    // read the plugin name
    const pluginName = yield askPluginNameToGen();

    let ctrlName = '';

    // read the controller name
    while (ctrlName.length < 1) {
      ctrlName = yield prompt('enter the controller name : ');
      if (ctrlName && isExist('controller', pluginName, ctrlName)) {
        archLog.error(`controller with name ${ctrlName} is already exist`);
        ctrlName = '';
      }
    }

    // if controllers folder not exist create it.
    const controllersPath = getPath('controllers', pluginName);

    if (!fs.existsSync(controllersPath)) {
      generate({
        type: 'folder',
        name: 'controllers',
        location: getPath('plugin', pluginName)
      });
    }

    // create the controller.
    generate({
      type: 'file',
      location: getPath('controllers', pluginName),
      name: ctrlName,
      template: 'controller'
    });

    process.exit(0);
  });
};

const genService = function () {
  co(function* () {
    const pluginName = yield askPluginNameToGen();

    let serviceName = '';

    // read the service name
    while (serviceName.length < 1) {
      serviceName = yield prompt('enter the service name : ');
      if (serviceName && isExist('service', pluginName, serviceName)) {
        archLog.error(`service with name ${serviceName} is already exist`);
        serviceName = '';
      }
    }

    // if services folder not exist create it.
    const servicesPath = getPath('services', pluginName);

    if (!fs.existsSync(servicesPath)) {
      generate({
        type: 'folder',
        name: 'services',
        location: getPath('plugin', pluginName)
      });
    }

    // create the service.
    generate({
      type: 'file',
      location: getPath('services', pluginName),
      name: serviceName,
      template: 'service'
    });

    process.exit(0);
  });
};

const genModel = function () {
  co(function* () {
    // let mongoEnabled = _.get(archConfig, 'options.MongoDB');
    //
    // if (!mongoEnabled) {
    //   archLog.error('sorry, mongoose support is disabled!');
    //   process.exit(1);
    // }

    const pluginName = yield askPluginNameToGen();

    let modelName = '';

    // read the model name
    while (modelName.length < 1) {
      modelName = yield prompt('enter the model name : ');
      if (modelName && isExist('model', pluginName, modelName)) {
        archLog.error(`model with name ${modelName} is already exist`);
        modelName = '';
      }
    }

    // if models folder not exist create it.
    const modelsPath = getPath('models', pluginName);

    if (!fs.existsSync(modelsPath)) {
      generate({
        type: 'folder',
        name: 'models',
        location: getPath('plugin', pluginName)
      });
    }

    // create the model.
    generate({
      type: 'file',
      location: getPath('models', pluginName),
      name: modelName,
      template: 'model'
    });

    process.exit(0);
  });
};

const genPolicy = function () {
  co(function* () {
    let policyName = '';

    // read the policy name
    while (policyName.length < 1) {
      policyName = yield prompt('enter the policy name : ');
      if (policyName && isExist('policy', null, policyName)) {
        archLog.error(`policy with name ${policyName} is already exist`);
        policyName = '';
      }
    }

    // create the policy.
    generate({
      type: 'file',
      location: getPath('policies'),
      name: policyName,
      template: 'policy'
    });

    process.exit(0);
  });
};

const genStrategy = function () {
  co(function* () {
    let strategyName = '';

    // read the policy name
    while (strategyName.length < 1) {
      strategyName = yield prompt('enter strategy name : ');
      if (strategyName && isExist('strategy', null, strategyName)) {
        archLog.error(`strategy with name ${strategyName} is already exist`);
        strategyName = '';
      }
    }

    const strategiesDir = getPath('strategies');
    if (!(yield archFs.exist(strategiesDir))) {
      fs.mkdirSync(strategiesDir);
    }

    // create the policy.
    generate({
      type: 'file',
      location: getPath('strategies'),
      name: strategyName,
      template: 'strategy'
    });

    process.exit(0);
  });
};

const genCrontask = function () {
  co(function* () {
    const pluginName = yield askPluginNameToGen();

    let crontaskName = '';

    // read the service name
    while (crontaskName.length < 1) {
      crontaskName = yield prompt('enter the crontask name : ');
      if (crontaskName && isExist('crontask', pluginName, crontaskName)) {
        archLog.error(`crontask with name ${crontaskName} is already exist`);
        crontaskName = '';
      }
    }

    // if crontasks folder not exist create it.
    const crontasksPath = getPath('crontasks', pluginName);

    if (!fs.existsSync(crontasksPath)) {
      generate({
        type: 'folder',
        name: 'crontasks',
        location: getPath('plugin', pluginName)
      });
    }

    // create the crontask.
    generate({
      type: 'file',
      location: getPath('crontasks', pluginName),
      name: crontaskName,
      template: 'crontask'
    });

    process.exit(0);
  });
};

module.exports = function (mode) {
  switch (mode) {
  case 'new':
    genNew();
    break;
  case 'plugin':
    genPlugin();
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
  case 'strategy':
    genStrategy();
    break;
  case 'crontask':
    genCrontask();
    break;
  default:
    archLog.error(`generator type ${mode} not supported!`);
    break;
  }
};
