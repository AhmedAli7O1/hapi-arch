const _ = require('lodash');
const path = require('path');
const folderGen = require('./folderGenerator');
const jsonGen = require('./jsonGenerator');

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
  }
}