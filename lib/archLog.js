const chalk = require('chalk');
const _ = require('lodash');
const APP = require('./text/app.json');

module.exports = {

  info: function () {
    const log = createLog(arguments);
    console.log(chalk.green.apply(null, log));
  },
  error: function () {
    const log = createLog(arguments);
    console.log(chalk.red.apply(null, log));
  },
  hint: function () {
    const log = createLog(arguments);
    console.log(chalk.yellow.apply(null, log));
  }

};

const createLog = function (args) {
  const text = _.toArray(args);
  text.unshift(APP.NAME_CONSOLE);
  return text;
};