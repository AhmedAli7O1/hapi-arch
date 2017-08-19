const fs = require('fs');
const path = require('path');

module.exports = function (options) {

  // create template path.
  let tmpPath = path.join(__dirname, '..', 'templates', options.template);

  /* eslint no-magic-numbers: "off" */
  if (tmpPath.indexOf('.yml') < 0) {
    tmpPath += '.yml';
  }

  // check if template exist.
  if (!fs.existsSync(tmpPath)) {
    throw new Error(`cannot find file template ${options.template}`);
  }
  // load the template.
  const tmp = fs.readFileSync(tmpPath);

  // write the template to a new file.
  options.name = options.name.indexOf('.yml') < 0 ? options.name + '.yml' : options.name;
  fs.writeFileSync(path.join(options.location, options.name), tmp);

};