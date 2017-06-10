const path = require("path");
const locations = require("./locations");
const homeDir = locations.APP_MIN_DIR;
const pluginsDir = path.join(homeDir, "app", "api");
const methodsDir = path.join(homeDir, "app", "methods");
const policiesDir = path.join(homeDir, "app", "policies");

module.exports = function (type, plugin, name) {

  let foundPath = "";

  switch (type) {
    case "home":
      foundPath = homeDir;
      break;
    case "archConfig":
      foundPath = path.join(homeDir, ".hapiarch.json");
      break;
    case "plugin":
      foundPath = path.join(pluginsDir, plugin);
      break;
    case "plugins":
      foundPath = pluginsDir;
      break;
    case "methods":
      foundPath = methodsDir;
      break;
    case "policies":
      foundPath = policiesDir;
      break;
    case "policy":
      foundPath = path.join(policiesDir, name);
      break;
    case "method":
      foundPath = path.join(methodsDir, name);
      break;
    case "controller":
      foundPath = path.join(pluginsDir, plugin, "controllers", name);
      break;
    case "controllers":
      foundPath = path.join(pluginsDir, plugin, "controllers");
      break;
    case "model":
      foundPath = path.join(pluginsDir, plugin, "models", name);
      break;
    case "models":
      foundPath = path.join(pluginsDir, plugin, "models");
      break;
    case "service":
      foundPath = path.join(pluginsDir, plugin, "services", name);
      break;
    case "services":
      foundPath = path.join(pluginsDir, plugin, "services");
      break;
  }

  return foundPath;

};