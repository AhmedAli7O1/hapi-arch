const fs = require('fs');
const path = require('path');

module.exports = function (location, name, template) {

  // create template path.
  let tmpPath = path.join(__dirname, 'templates', template);

  // check if template exist.
  if (!fs.statSync(tmpPath).isFile()) throw new Error(`cannot find file template ${template}`);

  // load the template.
  let tmp = fs.readFileSync(tmpPath);

  // write the template to a new file.
  fs.writeFileSync(path.join(location, name), tmp);

};