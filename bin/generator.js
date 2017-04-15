const path = require('path');
const co = require('co');
const prompt = require('co-prompt');
const os = require('os');
const generators = require('../lib/generators');
const archLog = require('../lib/archLog');
const pkg = require('../package.json');
const isExist = require('../lib/isExist');
const getPath = require('../lib/getPath');

module.exports = function (mode) {
  switch (mode) {
    case 'new':
      genNew();
      break;
    case 'controller':
      genController();
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
                            name: 'UserController.js'
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
                            name: 'User.js'
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
                            template: mongo === 'y' ? 'service.js' : 'service-no-mongo.js'
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
                ],
                "options": {
                  "MongoDB": mongo === 'y'
                }
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

    let ctrlName = '';

    // read the controller name
    while (ctrlName.length < 1) {
      ctrlName = yield prompt('enter the controller name : ');
      if (ctrlName && isExist('controller', pluginName, ctrlName)){
        archLog.error(`plugin with name ${ctrlName} is already exist`);
        ctrlName = '';
      }
    }

    // create the controller.
    generators.generate({
      location: getPath('controllers', pluginName),
      name: ctrlName + '.js',
      type: 'controller',
      template: 'controller.js'
    });

    process.exit(0);

  });
}