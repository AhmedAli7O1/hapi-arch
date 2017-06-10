const chalk = require("chalk");
const _ = require("lodash");
const APP = require("./text/app.json");

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
  text.unshift(APP.NAME_CONSOLE);
  return text;
}