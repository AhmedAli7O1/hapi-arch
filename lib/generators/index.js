const _ = require('lodash');
const path = require('path');
const folderGen = require('./folderGenerator');
const jsonGen = require('./jsonGenerator');
const fileGen = require('./fileGenerator');

module.exports.generateSchema = function (location, schema) {
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
      if (!genObj.disabled) {
        folderGen(genObj.location, genObj.name);
        if (genObj.sub) _.forEach(genObj.sub, x => {
          x.location = path.join(genObj.location, genObj.name);
          generate(x);
        });
      }
      break;
    case 'json':
      jsonGen(genObj.location, genObj.name, genObj.data);
      break;
    case 'config':
      fileGen(genObj.location, genObj.name, genObj.template || 'config.js');
      break;
    case 'routes':
      fileGen(genObj.location, genObj.name, genObj.template || 'routes.js');
      break;
    case 'controller':
      fileGen(genObj.location, genObj.name, genObj.template || 'controller.js');
      break;
    case 'service':
      fileGen(genObj.location, genObj.name, genObj.template || 'service.js');
      break;
    case 'model':
      if (!genObj.disabled)
        fileGen(genObj.location, genObj.name, genObj.template || 'model.js');
      break;
    case 'schema':
      fileGen(genObj.location, genObj.name, genObj.template || 'schema.js');
      break;
    case 'index':
      fileGen(genObj.location, genObj.name, genObj.template || 'index.js');
      break;
    case 'thirdParty':
      fileGen(genObj.location, genObj.name, genObj.template || 'thirdParty.js');
      break;
  }
}

module.exports.generate = generate;