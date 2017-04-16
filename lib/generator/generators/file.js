const fs = require('fs');
const path = require('path');

module.exports = function (options) {

  // create template path.
  let tmpPath = path.join(__dirname, '..', 'templates', options.template);

  if (tmpPath.indexOf('.js') < 0) tmpPath += '.js';

  // check if template exist.
  if (!fs.existsSync(tmpPath))
    throw new Error(`cannot find file template ${options.template}`);

  // load the template.
  let tmp = fs.readFileSync(tmpPath);

  // write the template to a new file.
  fs.writeFileSync(path.join(options.location, options.name + '.js'), tmp);

};