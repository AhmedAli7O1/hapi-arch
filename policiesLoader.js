'use strict';

const path = require('path');
const modulesLoader = require('./modulesLoader');

global.policies = modulesLoader.loadAll(DIRS.POLICIES);
