"use strict";

module.exports = function (server, options, services, components) {
  return function (lab) {

    const describe = lab.describe;
    const it = lab.it;
    const before = lab.before;
    const after = lab.after;
    const expect = lab.expect;

    const { UserService } = services;

    describe("math", () => {

      before((done) => {

        done();
      });

      after((done) => {

        done();
      });

      it("returns true when 1 + 1 equals 2", (done) => {

        expect(1 + 1).to.equal(2);
        done();
        
      });

      it("returns true when 1 + 1 equals 2", (done) => {

        expect(1 + 1).to.equal(2);
        done();
        
      });

      it("name equal to Hapi", (done) => {
        UserService.find()
          .then(res => {
            expect(res.name).to.equal("hapi");
            done();
          })
          .catch(err => {
            done(err);
          });
      });

    });

  }
};