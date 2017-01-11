'use strict';
//const should = require("should");
const fs = require("fs");
const Path = require("path").posix;
const should = require("should");
const WebSocket = require('faye-websocket');

const collada = require("../index");

const dirname = __dirname.replace(/\\/g, "/");
const models_directory = Path.join(dirname, "models");
const test_dae = Path.join(models_directory, "Sponza.DAE");
const test_dae_2 = Path.join(models_directory, "Amahani.dae");
const test_dependencies = [ '/images/2_00_SKAP.JPG',
  '/images/4_01_STUB-bump_nrm.tga',
  '/images/3_01_STUB.JPG',
  '/images/6_01_ST_KP.JPG',
  '/images/5_01_S_BA.JPG',
  '/images/7_01_St_kp-bump_nrm.tga',
  '/images/12_KAMEN-bump_nrm.tga',
  '/images/11_KAMEN.JPG',
  '/images/13_PROZOR1.JPG',
  '/images/9_RELJEF.JPG',
  '/images/0_SP_LUK.JPG',
  '/images/15_VRATA_KO.JPG',
  '/images/14_VRATA_KR.JPG',
  '/images/8_X01_ST.JPG',
  '/images/10_reljef-bump_nrm.tga',
  '/images/1_sp_luk-bump_nrm.tga' ].map(dep => Path.join(models_directory, dep));

describe("Collada utils", function () {

    it("#List dependencies of sponza example", function (done) {
        this.timeout(5000);
        collada.dependencies(test_dae)
            .then(dependencies => {
                should(test_dependencies).be.eql(dependencies);
                done();
            });
    });

    it("#List all model dependencies in test directory", function (done) {
        this.timeout(10000);
        fs.readdir(models_directory, (err, files) => Promise.all(
                files
                    .filter(file => Path.extname(file) === ".dae" || Path.extname(file) === ".DAE")
                    .map(file => collada.dependencies(Path.join(models_directory, file)))
            ).then(() => done()).catch(done)   
        );
    });

    it("#Validate amahani example", function (done) {
        this.timeout(5000);
        collada.validate(test_dae_2).then(done).catch(done);
    });

});

var client;
var port = 9229;

describe("Websocket server", function () {
    
    before("Create collada server and client", function(done) {
        collada.start_ws_server(port);
        client = new WebSocket.Client("ws://127.0.0.1:" + port);
        client.on("open", () => { done(); });
    });

    it("#List dependencies", function (done) {
        this.timeout(2000);
        const id = 1;
        const cb = event => {
          const msg = JSON.parse(event.data);
          if (msg.event === "callback") {
            msg.id.should.equal(1);
            should.exist(msg.data);
            client.removeListener("message", cb);
            done();
          }
        };
        client.on("message", cb);
        client.send(JSON.stringify({event: "dependencies", path: test_dae, id: id}));
    });

    it("#Concurrent list dependency calls", function (done) {
        this.timeout(10000);
        let count = 0;
        const cb = event => {
          const msg = JSON.parse(event.data);
          if (msg.event === "callback") {
            should.exist(msg.data);
            count ++;
            if (count === 10) {
              client.removeListener("message", cb);
              done();
            }
          }
        };
        client.on("message", cb);
        for (let i = 0; i < 10; i++) {
          client.send(JSON.stringify({event: "dependencies", path: test_dae, id: i}));
        }
    });

    it("#Validate amahani example", function (done) {
        this.timeout(2000);
        const id = 1;
        const cb = event => {
          const msg = JSON.parse(event.data);
          if (msg.event === "callback") {
            msg.id.should.equal(1);
            should.not.exist(msg.err);
            client.removeListener("message", cb);
            done();
          }
        };
        client.on("message", cb);
        client.send(JSON.stringify({event: "validate", path: test_dae_2, id: id}));
    });

    it("#Not validate Sponza example", function (done) {
        this.timeout(2000);
        const id = 1;
        const cb = event => {
          const msg = JSON.parse(event.data);
          if (msg.event === "callback") {
            msg.id.should.equal(1);
            should.exist(msg.err);
            client.removeListener("message", cb);
            done();
          }
        };
        client.on("message", cb);
        client.send(JSON.stringify({event: "validate", path: test_dae, id: id}));
    });


    it("#Concurrent validate calls", function (done) {
        this.timeout(10000);
        let count = 0;
        const cb = event => {
          const msg = JSON.parse(event.data);
          if (msg.event === "callback") {
            should.not.exist(msg.err);
            count ++;
            if (count === 30) {
              client.removeListener("message", cb);
              done();
            }
          }
        };
        client.on("message", cb);
        for (let i = 0; i < 30; i++) {
          client.send(JSON.stringify({event: "validate", path: test_dae_2, id: i}));
        }
    });
    
});