const co = require('co');
const prompt = require('co-prompt');
const os = require('os');
const generators = require('../lib/generators');
const archLog = require('../lib/archLog');
const pkg = require('../package.json');

module.exports = function (mode) {
  switch (mode) {
    case 'new':
      genNew();
      break;
    default:
      archLog.error(`generator type ${mode} not supported!`);
      break;
  }
};

function genNew () {

  // take the user input.
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

    // generate the app structure.
    const schema = [
      {
        type: 'folder',
        name: appName,
        sub: [
          {
            type: 'json',
            name: 'package',
            data: appPkg
          }
        ]
      }
    ];
    generators(process.cwd(), schema);

  });

}