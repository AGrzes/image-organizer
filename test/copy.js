var mock = require("mock-fs");
var expect = require("chai").expect;
var copy = require("../copy");
var StreamTest = require("streamtest");
var fs = require("fs");
describe.only("fs_scan", () => {
    beforeEach(() => {
        mock({
            "/source": "source",
            "/exist" : "exist"
        });
    });
    afterEach(() => mock.restore());
    StreamTest.versions.forEach(function (version) {
        describe("for " + version + " streams", function () {
            it("should copy file", function (done) {
                StreamTest[version].fromObjects([{
                    file: "/source",
                    target: "target"
                }]).pipe(copy("/")).pipe(StreamTest[version].toObjects((error) => {
                    expect(fs.existsSync("/target")).to.be.true;
                    expect(fs.readFileSync("/target","UTF-8")).to.be.equal("source");
                    done(error);
                }));
            });

            it("should not override existing file", function (done) {
                StreamTest[version].fromObjects([{
                    file: "/source",
                    target: "exist"
                }]).pipe(copy("/")).pipe(StreamTest[version].toObjects((error) => {
                    expect(fs.existsSync("/exist")).to.be.true;
                    expect(fs.readFileSync("/exist","UTF-8")).to.be.equal("exist");
                    done(error);
                }));
            });
            it("should skip missing source", function (done) {
                StreamTest[version].fromObjects([{
                    file: "/not-exist",
                    target: "target"
                }]).pipe(copy("/")).pipe(StreamTest[version].toObjects((error) => {
                    expect(fs.existsSync("/target")).to.be.false;
                    done(error);
                }));
            });            
        });
    });
});