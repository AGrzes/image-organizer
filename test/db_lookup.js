var db_lookup = require('../db_lookup');
var expect = require('chai').use(require('chai-subset')).expect;
var StreamTest = require('streamtest');
var PouchDB = require('pouchdb-core')
PouchDB.plugin(require('pouchdb-adapter-memory')).plugin(require('pouchdb-mapreduce'));
var db = new PouchDB('db_lookup', {
    adapter: 'memory'
});
describe('fs_lookup', () => {
    before(() => {
        db.put({
            _id: 'md5',
        })
    })
    StreamTest.versions.forEach(function (version) {
        describe('for ' + version + ' streams', function () {

            it('should find document by md5', (done) => {
                StreamTest[version].fromObjects([{
                    md5: 'md5'
                }]).pipe(db_lookup(db)).pipe(StreamTest[version].toObjects((error, objects) => {
                    expect(objects).to.containSubset([{
                        doc: {
                            _id: 'md5'
                        }
                    }])
                    done(error);
                }))
            })

            it('should construct document if not found', (done) => {
                StreamTest[version].fromObjects([{
                    md5: '!md5',
                    file: 'file',
                    exif: 'exif'
                }]).pipe(db_lookup(db)).pipe(StreamTest[version].toObjects((error, objects) => {
                    expect(objects).to.containSubset([{
                        doc: {
                            _id: '!md5',
                            files: {
                                file: 'PRESENT'
                            },
                            exif: 'exif'
                        }
                    }])
                    done(error);
                }))
            })
        })

    })
})