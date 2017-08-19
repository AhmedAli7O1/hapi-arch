'use strict';

/* eslint no-magic-numbers: "off" */

// params : server, options, services, components
module.exports = function (server, options, services) {
  return function (lab) {

    const {
      describe,
      it,
      before,
      after,
      expect
    } = lab;

    const { UserService } = services;

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

      it('returns true when 1 + 1 equals 2', (done) => {

        expect(1 + 1).to.equal(2);
        done();

      });

      it('name equal to Hapi', (done) => {
        UserService.find()
          .then((res) => {
            expect(res.name).to.equal('hapi');
            done();
          })
          .catch((err) => {
            done(err);
          });
      });

    });

  };
};