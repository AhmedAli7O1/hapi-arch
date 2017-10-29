'use strict';

const fse = require('fs-extra');
const path = require('path');
const { expect } = require('chai');
const config = require('../../lib/config')._test;

describe('config', () => {
  describe('#load()', () => {
    const temp = './temp';

    const data = [
      path.resolve(`${temp}/connection.js`),
      path.resolve(`${temp}/mongo.json`),
      path.resolve(`${temp}/development`),
      path.resolve(`${temp}/development/connection.js`)
    ];

    before(async () => {
      await Promise.all([
        fse.outputFile(
          data[0],
          'module.exports = { attrOne: "one", attrTwo: "two" }'
        ),
        fse.outputFile(data[1], '{ "attrTwo": "two" }'),
        fse.ensureDir(data[2]),
        fse.outputFile(
          data[3],
          'module.exports = { attrTwo: "two-dev", attrThree: "three" }'
        )
      ]);
    });

    it('should load common and env configurations', async () => {
      const result = await config.load(path.resolve(temp), 'development');

      expect(result).to.deep.equal({
        connection: {
          attrOne: 'one',
          attrTwo: 'two-dev',
          attrThree: 'three'
        },
        mongo: { attrTwo: 'two' }
      });
    });

    after(async () => {
      await fse.remove(temp);
    });
  });
});
