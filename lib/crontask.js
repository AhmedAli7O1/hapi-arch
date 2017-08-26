'use strict';

const _ = require('lodash');
const appConfig = require('./config');
const archLog = require('./archLog');
const schedule = require('node-schedule');

module.exports = function (crontasks) {
  appConfig(ENV)
    .then((config) => {

      _.forEach(config.crontask, (cronConfig, name) => {
        const cron = crontasks[name];
        if (cron) {
          archLog.info(`crontask ${name} started!`);
          schedule.scheduleJob(cronConfig, () => {
            cron();
          });
        }
        else {
          archLog.error(`crontask ${name} defined in config/crontask.js not found!`);
        }
      });

    })
    .catch(archLog.error);
};