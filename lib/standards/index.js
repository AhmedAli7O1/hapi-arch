const locations = require('../locations');
const config = require('../../config');
const archFs = require('../archFs');
const archLog = require('../archLog');
const { CLIEngine } = require('eslint');

module.exports = function ({ fix }) {
  const cli = new CLIEngine({
    cwd: locations.APP_MIN_DIR,
    envs: ['node', 'es6'],
    globals: config.globals,
    fix: fix,
    rulePaths: [archFs.join(__dirname, 'rules')]
  });
  
  const report = cli.executeOnFiles(['**/*.js', '*.js']);
  const formatter = cli.getFormatter();
  
  if (fix) {
    CLIEngine.outputFixes(report);
  }

  if (report.errorCount || report.warningCount) {
    console.log(formatter(report.results));
  }

  if (report.errorCount) {
    archLog.error('to be able to start the server, first you must resolve all linting errors, either manually or by running >> npm start fix');
    process.exit(0);
  }
};