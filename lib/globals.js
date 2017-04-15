'use strict';

const colors = require('colors/safe');

global._ = require('lodash');
global.moment = require('moment');
global.TEST = [];
global.ENV = process.env.NODE_ENV || 'development';

console.log(colors.green(`[ HAPI ARCH ] Environment >> ${ENV}`));