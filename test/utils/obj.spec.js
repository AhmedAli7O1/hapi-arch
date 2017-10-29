'use strict';

const objTest = require('../../utils/obj');
const { expect } = require('chai');


describe('utils/obj', () => {
  describe('#arrayToObject()', () => {
    it('should transform array to object using key & value', () => {

      const data = [
        { name: 'fileOne', path: '/file-one' },
        { name: 'fileTwo', path: '/file-two' },
        { name: 'fileThree', path: '/file-three' }
      ];

      const result = objTest.arrayToObject(data, 'name', 'path');

      expect(result).to.deep.equal({
        fileOne: '/file-one',
        fileTwo: '/file-two',
        fileThree: '/file-three'
      });

    });
  });
});