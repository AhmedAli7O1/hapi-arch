#!/usr/bin/env node

const chalk = require('chalk');
const co = require('co');
const prompt = require('co-prompt');
const program = require('commander');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));
const path = require('path');
const archLog = require('./archLog');
const pkg = require('./package.json');
const os = require('os');

let c = (y, w, h) => w / 2 * Math.sqrt(1 - y * y / ( h * h )) + 0.5 | 0;
let r = 22, p = r / 2, q = p / 5, s = '';

for (let y = -p; ++y < p;) {
  for (let x = -r; ++x < r;) {
    let d = c(y, r * 2, p),
    e = c(y + q, r / 5, q),
    f = e - p,
    g = e + p,
    h = c(y, r * 1.3, r / 3);
    s += (x >= d || x <= -d || (x > -g && x < f) || (x < g && x > -f) || (y > q && (x > -h && x < h))) ? ' ' : 0;
  }
  s += '\n';
}

console.log(s);
archLog.info(`Welcome, to HAPI ARCH version ${pkg.version}`);

program
    .arguments('<action>')
    .action((action) => {

      switch (action) {

        case 'init':
          init();
          break;

      }

    })
    .parse(process.argv);

// init a new hapi-arch project
function init() {
  co(function *() {

    let appName = '',
    version = '1.0.0',
    description = 'hapi server',
    author = os.userInfo().username;

    while (appName.length < 1) {
      appName = yield prompt('enter the app name: ');
      if (appName.length > 1) {
        appName = appName.toLowerCase();
        appName = appName.replace(' ', '-');
        let ans = yield prompt(`your app name will be ${appName} is that okay? (y): `);
        if (ans.toLowerCase() !== 'y') appName = '';
      }
    }

    let promptDescription = yield prompt('enter the app description: ');
    let promptVersion = yield prompt('enter the app version (default 1.0.0) : ');
    let promptAuthor = yield prompt(`enter the app author (default ${author}) : `) || author;

    const appPkg = {
      name: appName,
      version: promptVersion || version,
      description: promptDescription || description,
      author: promptAuthor || author,
      dependencies: {
        "hapi-arch": `^${pkg.version}`
      }
    };

    console.log(JSON.stringify(appPkg, null, 2));
    let ans = yield prompt('this is your package.json file looks like, is that okay? (y) : ');


    if (ans !== 'y') {
      archLog.error('app creation canceled!');
      process.exit(0);
    }

    createApp(appName, process.cwd(), appPkg);

  });
}

function createApp(name, location, appPkg) {
  co(function *() {
    try {
      const appDir = path.join(location, name);
      yield fs.mkdirAsync(appDir);
      yield fs.writeFileAsync(path.join(appDir, 'package.json'), JSON.stringify(appPkg, null, 2));
    }
    catch (e) {
      console.log(e)
    }
  });
}