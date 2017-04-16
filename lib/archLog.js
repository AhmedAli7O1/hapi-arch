const chalk = require('chalk');
const _ = require('lodash');

module.exports = {

  info: function () {
    let log = createLog(arguments);
    console.log(chalk.green.apply(null, log));
  },
  error: function () {
    let log = createLog(arguments);
    console.log(chalk.red.apply(null, log));
  },
  hint: function () {
    let log = createLog(arguments);
    console.log(chalk.yellow.apply(null, log));
  }

};

function createLog (args) {
  let text = _.toArray(args);
  text.unshift('[ HAPI ARCH ]');
  return text;
}