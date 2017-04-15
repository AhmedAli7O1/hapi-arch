const _ = require('lodash');
const path = require('path');
const folderGen = require('./folderGenerator');
const jsonGen = require('./jsonGenerator');
const fileGen = require('./fileGenerator');

module.exports = function (location, schema) {
  try {
    _.forEach(schema, genObj => {
      genObj.location = location;
      generate(genObj);
    });
  }
  catch (e) { console.log(e); }
};

function generate (genObj) {
  switch (genObj.type) {
    case 'folder':
      folderGen(genObj.location, genObj.name);
      if (genObj.sub) _.forEach(genObj.sub, x => {
        x.location = path.join(genObj.location, genObj.name);
        generate(x);
      });
      break;
    case 'json':
      jsonGen(genObj.location, genObj.name, genObj.data);
      break;
    case 'config':
      fileGen(genObj.location, genObj.name, 'config.js');
      break;
    case 'routes':
      fileGen(genObj.location, genObj.name, 'routes.js');
      break;
    case 'controller':
      fileGen(genObj.location, genObj.name, 'controller.js');
      break;
    case 'service':
      fileGen(genObj.location, genObj.name, 'service.js');
      break;
    case 'model':
      fileGen(genObj.location, genObj.name, 'model.js');
      break;
    case 'schema':
      fileGen(genObj.location, genObj.name, 'schema.js');
      break;
    case 'index':
      fileGen(genObj.location, genObj.name, 'index.js');
      break;
    case 'thirdParty':
      fileGen(genObj.location, genObj.name, 'thirdParty.js');
      break;
  }
}