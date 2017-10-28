'use strict';

const fse = require('fs-extra');
const path = require("path");
const { expect } = require("chai");
const _ = require('lodash');
const config = require('../../lib/config')._test;

describe('config', () => {
  describe('#load()', () => {
    
    const temp = './temp';
    
    const data = [
      path.resolve(`${temp}/connection.js`),
      path.resolve(`${temp}/mongo.json`),
      path.resolve(`${temp}/development`),
      path.resolve(`${temp}/development/connection.js`),
    ];

    before(async () => {
      await Promise.all([
        fse.outputFile(data[0], 'module.exports = { attrOne: "one" }'),
        fse.outputFile(data[1], '{ "attrTwo": "two" }'),
        fse.ensureDir(data[2]),
        fse.ensureFile(data[3])
      ]);
    });
    
    it('should load common and env configurations', async () => {

      const result = await config.load(path.resolve(temp), 'development');
      
      expect(result).to.deep.equal({
        connection: {
          attrOne: 'one'
        },
        mongo: {
          attrTwo: 'two'
        }
      });

    });

    after(async () => {
      await fse.remove(temp);
    });

  });
});