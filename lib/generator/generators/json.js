const fs = require('fs');
const path = require('path');

module.exports = function (options) {
  try {
    fs.writeFileSync(path.join(options.location, options.name + '.json'), JSON.stringify(options.data, null, 2));
  }
  catch (e) { console.log(e); }
};