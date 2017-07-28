const fs = require("fs");
const path = require("path");

module.exports = function (options){
  fs.mkdirSync(path.join(options.location, options.name));
};