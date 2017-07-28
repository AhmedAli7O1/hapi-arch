const fs = require("fs");
const path = require("path");
const co = require("co");
const prompt = require("co-prompt");
const os = require("os");
const archLog = require("../lib/archLog");
const pkg = require("../package.json");
const isExist = require("../lib/isExist");
const getPath = require("../lib/getPath");
const locations = require("../lib/locations");
const Generator = require("../lib/generator");
const generator = new Generator();

module.exports = function (mode) {
  switch (mode) {
  case "new":
    genNew();
    break;
  case "plugin":
    genPlugin();
    break;
  case "controller":
    genController();
    break;
  case "service":
    genService();
    break;
  case "model":
    genModel();
    break;
  case "policy":
    genPolicy();
    break;
  case "method":
    genMethod();
    break;
  default:
    archLog.error(`generator type ${mode} not supported!`);
    break;
  }
};

function genNew() {

  // take the user input.
  co(function *() {

    let appName = "";
    let version = "1.0.0";
    let description = "hapi server";
    let author = os.userInfo().username;

    while (appName.length < 1) {
      appName = yield prompt("enter the app name: ");
      if (appName.length > 1) {
        appName = appName.toLowerCase();
        appName = appName.replace(" ", "-");
        let ans = yield prompt(`your app name will be ${appName} is that okay? (y): `);
        if (ans.toLowerCase() !== "y") appName = "";
      }
    }

    let promptDescription = yield prompt("enter the app description: ");
    let promptVersion = yield prompt("enter the app version (default 1.0.0) : ");
    let promptAuthor = yield prompt(`enter the app author (default ${author}) : `) || author;
    let mongo = yield prompt("do you want to include mongodb support using mongoose? (y/n) default to n : ");
    let existingMongo = yield prompt("do you have existing mongodb database? (y/n) default to n : ");

    if (mongo === "y") {
      yield prompt("since you chosen to include mongoose support, you should setup a mongo instance before starting the server. (press enter)");
    }

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
        start: "node index.js",
        test: "node index.js --env=test"
      },
    };

    // check if the user want to add mongoose.
    if (mongo === "y") appPkg.dependencies["mongoose"] = "*";

    archLog.info(JSON.stringify(appPkg, null, 2));
    let ans = yield prompt("this is your package.json file looks like, is that okay? (y) : ");


    if (ans !== "y") {
      archLog.error("app creation canceled!");
      process.exit(0);
    }

    // generate the app structure.
    const schema = {
      type: "folder",
      name: appName,
      location: process.cwd(),
      sub: [
        {
          type: "json",
          name: "package",
          data: appPkg
        },
        {
          type: "folder",
          name: "config",
          sub: [
            {
              type: "folder",
              name: "development"
            },
            {
              type: "folder",
              name: "staging"
            },
            {
              type: "folder",
              name: "production"
            },
            {
              type: "folder",
              name: "test"
            },
            {
              type: "file",
              name: "connection",
              template: "connection"
            },
            {
              type: "file",
              name: "mongo",
              template: existingMongo === "y" ? "mongo" : "mongo-new" 
            }
          ]
        },
        {
          type: "folder",
          name: "app",
          sub: [
            {
              type: "folder",
              name: "api",
              sub: [
                {
                  type: "folder",
                  name: "pluginOne",
                  sub: [
                    {
                      type: "folder",
                      name: "controllers",
                      sub: [
                        {
                          type: "file",
                          name: "UserController",
                          template: "controller-new"
                        }
                      ]
                    },
                    {
                      type: "folder",
                      name: "models",
                      disabled: mongo !== "y",
                      sub: [
                        {
                          type: "file",
                          name: "User",
                          template: "model-new"
                        }
                      ]
                    },
                    {
                      type: "folder",
                      name: "schema",
                      sub: [
                        {
                          type: "file",
                          name: "GetSchema",
                          template: "schema"
                        },
                        {
                          type: "file",
                          name: "PostSchema",
                          template: "schema"
                        }
                      ]
                    },
                    {
                      type: "folder",
                      name: "services",
                      sub: [
                        {
                          type: "file",
                          name: "UserService",
                          template: mongo === "y" ? "service-new-mongo" : "service-new"
                        }
                      ]
                    },
                    {
                      type: "file",
                      name: "routes",
                      template: "routes"
                    },
                    {
                      type: "folder",
                      name: "test",
                      sub: [
                        {
                          type: "file",
                          name: "user.spec.js",
                          template: "test"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: "json",
          name: "arch",
          data: {
            "plugins": {
              "blacklist": [
                "pluginName"
              ]
            },
            "archServices": (mongo === "y" ? ["mongo"]: []),
            "archPlugins": (mongo === "y" ? ["mongoose"]: [])
          }
        },
        {
          type: "file",
          name: "index",
          template: "index"
        },
        {
          type: "file",
          name: "thirdParty",
          template: "thirdParty"
        },
        {
          type: "file",
          name: "bootstrap",
          template: "bootstrap"
        },
        {
          type: "folder",
          name: "archServices"
        },
        {
          type: "folder",
          name: "archPlugins"
        }
      ]
    };

    generate(schema);

    archLog.hint(`Done! now >> cd ${appName} && npm install`);

    process.exit(0);

  });

}

function genPlugin () {
  co(function *() {

    let pluginName = "";

    // read the plugin name
    while (pluginName.length < 1) {
      pluginName = yield prompt("enter the plugin name : ");
      // check if the entered plugin is exist.
      if (pluginName && isExist("plugin", pluginName)) {
        archLog.error(`plugin found with the name ${pluginName}`);
        pluginName = "";
      }
    }

    let mongo = yield prompt("do you want to include mongodb support using mongoose? (y) : ");

    if (mongo === "y") {
      yield prompt("since you chosen to include mongoose support, you should setup a mongo instance before starting the server. (press enter)");
    }

    const schema = {
      type: "folder",
      name: pluginName,
      location: path.join(locations.APP_MIN_DIR, "app", "api"),
      sub: [
        {
          type: "folder",
          name: "controllers",
          sub: [
            {
              type: "file",
              name: "UserController",
              template: "controller-new"
            }
          ]
        },
        {
          type: "folder",
          name: "models",
          disabled: mongo !== "y",
          sub: [
            {
              type: "file",
              name: "User",
              template: "model-new"
            }
          ]
        },
        {
          type: "folder",
          name: "schema",
          sub: [
            {
              type: "file",
              name: "GetSchema",
              template: "schema"
            },
            {
              type: "file",
              name: "PostSchema",
              template: "schema"
            }
          ]
        },
        {
          type: "folder",
          name: "services",
          sub: [
            {
              type: "file",
              name: "UserService",
              template: mongo === "y" ? "service-new-mongo" : "service-new"
            }
          ]
        },
        {
          type: "file",
          name: "routes",
          template: "routes"
        }
      ]
    };

    generate(schema);

    archLog.hint("Done!");

    process.exit(0);

  });
}

function genController() {
  co(function *() {

    // read the plugin name
    let pluginName = yield askPluginNameToGen();

    let ctrlName = "";

    // read the controller name
    while (ctrlName.length < 1) {
      ctrlName = yield prompt("enter the controller name : ");
      if (ctrlName && isExist("controller", pluginName, ctrlName)) {
        archLog.error(`controller with name ${ctrlName} is already exist`);
        ctrlName = "";
      }
    }

    // if controllers folder not exist create it.
    const controllersPath = getPath("controllers", pluginName);

    if (!fs.existsSync(controllersPath)) {
      generate({
        type: "folder",
        name: "controllers",
        location: getPath("plugin", pluginName)
      });
    }

    // create the controller.
    generate({
      type: "file",
      location: getPath("controllers", pluginName),
      name: ctrlName,
      template: "controller"
    });

    process.exit(0);

  });
}

function genService() {
  co(function *() {

    let pluginName = yield askPluginNameToGen();

    let serviceName = "";

    // read the service name
    while (serviceName.length < 1) {
      serviceName = yield prompt("enter the service name : ");
      if (serviceName && isExist("service", pluginName, serviceName)) {
        archLog.error(`service with name ${serviceName} is already exist`);
        serviceName = "";
      }
    }

    // if services folder not exist create it.
    const servicesPath = getPath("services", pluginName);

    if (!fs.existsSync(servicesPath)) {
      generate({
        type: "folder",
        name: "services",
        location: getPath("plugin", pluginName)
      });
    }

    // create the service.
    generate({
      type: "file",
      location: getPath("services", pluginName),
      name: serviceName,
      template: "service"
    });


    process.exit(0);

  });
}

function genModel() {
  co(function *() {

    // let mongoEnabled = _.get(archConfig, "options.MongoDB");
    //
    // if (!mongoEnabled) {
    //   archLog.error("sorry, mongoose support is disabled!");
    //   process.exit(1);
    // }

    let pluginName = yield askPluginNameToGen();

    let modelName = "";

    // read the model name
    while (modelName.length < 1) {
      modelName = yield prompt("enter the model name : ");
      if (modelName && isExist("model", pluginName, modelName)) {
        archLog.error(`model with name ${modelName} is already exist`);
        modelName = "";
      }
    }

    // if models folder not exist create it.
    const modelsPath = getPath("models", pluginName);

    if (!fs.existsSync(modelsPath)) {
      generate({
        type: "folder",
        name: "models",
        location: getPath("plugin", pluginName)
      });
    }

    // create the model.
    generate({
      type: "file",
      location: getPath("models", pluginName),
      name: modelName,
      template: "model"
    });

    process.exit(0);

  });
}

function genPolicy() {
  co(function *() {

    let policyName = "";

    // read the policy name
    while (policyName.length < 1) {
      policyName = yield prompt("enter the policy name : ");
      if (policyName && isExist("policy", null, policyName)) {
        archLog.error(`policy with name ${policyName} is already exist`);
        policyName = "";
      }
    }

    // create the policy.
    generate({
      type: "file",
      location: getPath("policies"),
      name: policyName,
      template: "policy"
    });

    process.exit(0);

  });
}

function genMethod() {
  co(function *() {

    let methodName = "";

    // read the method name
    while (methodName.length < 1) {
      methodName = yield prompt("enter the method name : ");
      if (methodName && isExist("method", null, methodName)) {
        archLog.error(`method with name ${methodName} is already exist`);
        methodName = "";
      }
    }

    // create the method.
    generate({
      type: "file",
      location: getPath("methods"),
      name: methodName,
      template: "method"
    });

    process.exit(0);

  });
}

function askPluginNameToGen() {
  return co(function *() {

    let pluginName = "";

    // read the plugin name
    while (pluginName.length < 1) {
      pluginName = yield prompt("enter the plugin name : ");
      // check if the entered plugin is exist.
      if (pluginName && !isExist("plugin", pluginName)) {
        archLog.error(`no plugins found with the name ${pluginName}`);
        pluginName = "";
      }
    }

    return pluginName;

  });
}

function generate (data) {
  try {
    generator.generate(data);
  }
  catch (e) {
    archLog.error(e);
    process.exit(1);
  }
}