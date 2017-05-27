"use strict";

const path = require("path");
const fs = require("fs");

/** LOAD CONFIGURATIONS BASED ON THE ENVIRONMENT VARIABLE */
const config = require(path.join(DIRS.CONFIG, 'env', ENV + '.js'));

global.CONFIG = config;