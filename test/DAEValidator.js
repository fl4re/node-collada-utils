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
        dAEValidator(amahani_dae).then(done).catch(done);
    });

    it("#Unvalid sponza example", function (done) {
        dAEValidator(sponza_dae).then(() => {
          done("Sponza shouldn't be valid!");
        }).catch(() => {
          done();
        });
    });

});
