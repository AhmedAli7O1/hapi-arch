const fs = require('fs');
const path = require('path');
const locations = require('./locations');

module.exports = function (type, plugin, comp) {

  let exist = false;

  switch (type) {
  case 'plugin':
    exist = fs.existsSync(getPluginPath(plugin));
    break;
  case 'controller':
    exist = fs.existsSync(path.join(getPluginPath(plugin), 'controllers', comp + '.js'));
    break;
  case 'model':
    exist = fs.existsSync(path.join(getPluginPath(plugin), 'models', comp + '.js'));
    break;
  case 'service':
    exist = fs.existsSync(path.join(getPluginPath(plugin), 'services', comp + '.js'));
    break;
  case 'crontask':
    exist = fs.existsSync(path.join(getPluginPath(plugin), 'crontasks', comp + '.js'));
    break;
  case 'method':
    exist = fs.existsSync(path.join(process.cwd(), 'app', 'methods', comp + '.js'));
    break;
  case 'policy':
    exist = fs.existsSync(path.join(process.cwd(), 'app', 'policies', comp + '.js'));
    break;
  case 'archConfig':
    exist = fs.existsSync(path.join(process.cwd(), '.hapiarch.json'));
    break;
  case 'strategy':
    exist = fs.existsSync(path.join(process.cwd(), 'app', 'strategies', comp + '.js'));
    break;
  }

  return exist;

};

const getPluginPath = function (plugin) {
  return path.join(locations.APP_MIN_DIR, 'app', 'api', plugin);
};