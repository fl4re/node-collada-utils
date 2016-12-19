'use strict';
//const should = require("should");
const Path = require("path").posix;

const dAEValidator = require("../lib/DAEValidator");

const dirname = __dirname.replace(/\\/g, "/");
const models_directory = Path.join(dirname, "models");
const sponza_dae = Path.join(models_directory, "Sponza.DAE");
const amahani_dae = Path.join(models_directory, "Amahani.dae");

describe("Collada validator", function () {
    
    it("#Valid amahani example", function (done) {
        this.timeout(5000);
        dAEValidator(amahani_dae).then(done).catch(done);
    });

    it("#Unvalid sponza example", function (done) {
        this.timeout(5000);
        dAEValidator(sponza_dae).then(() => {
          done("Sponza shouldn't be valid!");
        }).catch(err => {
          let is_error = !err.toString(err).includes("FAILED.");
          if (is_error) {
            done(err);
          } else {
            done();
          }
        });
    });

});
