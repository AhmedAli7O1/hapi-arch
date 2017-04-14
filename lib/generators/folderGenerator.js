const fs = require('fs');
const path = require('path');

module.exports = function (location, folder){
  fs.mkdirSync(path.join(location, folder));
};