var expect = require("chai").expect;
var fs_scan = require("../fs_scan");
var StreamTest = require("streamtest");
var mock = require("mock-fs");
describe("fs_scan", () => {
    before(() => {


        mock({
            "/base/dir1/file1": "",
            "/base/dir2/file2": "",
            "/another/dir3/file3": ""
        });
    });
    after(() => mock.restore());
    StreamTest.versions.forEach(function(version) {
        describe("for " + version + " streams", function() {
            it("should list all files under base", function(done) {
                fs_scan("/base/**").pipe(StreamTest[version].toObjects((error, objects) => {
                    expect(objects).to.be.deep.equals([{
                        files: ["/base/dir1/file1"]
                    },
                    {
                        files: ["/base/dir2/file2"]
                    }
                    ]);
                    done(error);
                }));
            });
        });
    });
});
