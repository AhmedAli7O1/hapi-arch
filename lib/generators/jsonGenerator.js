const fs = require('fs');
const path = require('path');

module.exports = function (location, fileName, data) {
  try {
    fs.writeFileSync(path.join(location, fileName + '.json'), JSON.stringify(data, null, 2));
  }
  catch (e) { console.log(e); }
};