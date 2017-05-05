'use strict';

const path = require('path');
const Lab = require('lab');
const Code = require('code');

const lab = exports.lab = Lab.script();

let server = require(path.join(process.cwd(), 'index'));

const suite = lab.suite;
const test = lab.test;
const expect = Code.expect;
const before = lab.before;
const beforeEach = lab.beforeEach;
const describe = lab.describe;
const after = lab.after;
const it = lab.it;

global.suite = lab.suite;
global.test = lab.test;
global.expect = Code.expect;
global.before = lab.before;
global.beforeEach = lab.beforeEach;
global.after = lab.after;
global._server = server;

before((done) => server.once('start', done));

suite('API TEST', () => {
  test('start the server', (done) => {
    _.forEach(TEST, testFile => require(testFile));
    done();
  });
});


after((done) => {
  server.stop();
  done();
});