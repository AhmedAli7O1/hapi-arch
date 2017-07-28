"use strict";

module.exports = function (server, options, services, components, lab) {

  const describe = lab.describe;
  const it = lab.it;
  const before = lab.before;
  const after = lab.after;
  const expect = lab.expect;

  describe('math', () => {

    before((done) => {

      done();
    });

    after((done) => {

      done();
    });

    it('returns true when 1 + 1 equals 2', (done) => {

      expect(1 + 1).to.equal(2);
      done();
    });
  });

};