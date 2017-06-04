var fs_lookup = require('../fs_lookup');
var expect = require('chai').use(require('chai-subset')).expect;
var StreamTest = require('streamtest');
describe('fs_lookup', () => {
    StreamTest.versions.forEach(function (version) {
        describe('for ' + version + ' streams', function () {
            describe('md5', () => {
                it('should calculate md5', (done) => {
                    StreamTest[version].fromObjects([{
                        file: 'test/data/md5'
                    }]).pipe(fs_lookup.md5()).pipe(StreamTest[version].toObjects((error, objects) => {                       
                        expect(objects).to.containSubset([{
                            md5: 'd41d8cd98f00b204e9800998ecf8427e'
                        }])
                        done(error);
                    }))
                })
            })
        })
    })
})