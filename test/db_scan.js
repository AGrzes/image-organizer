var expect = require('chai').use(require('chai-subset')).expect;
var db_scan = require('../db_scan');
var StreamTest = require('streamtest');
var PouchDB = require('pouchdb-core')
PouchDB.plugin(require('pouchdb-adapter-memory')).plugin(require('pouchdb-mapreduce'));
var db = new PouchDB('db_scan', {
  adapter: 'memory'
});

describe('db_scan', () => {
  before(() => {
    db.put({
      _id: 'file1',
      files: ['/base/dir1/file1']
    })
    db.put({
      _id: 'file2',
      files: ['/base/dir2/file2']
    })
    db.put({
      _id: 'file3',
      files: ['/another/dir3/file3']
    })
  })
  StreamTest.versions.forEach(function(version) {

    describe('for ' + version + ' streams', function() {
      it('should list all documents with file under base', function(done) {
        db_scan(db, '/base/**').pipe(StreamTest[version].toObjects((error, objects) => {

          expect(objects).to.containSubset([{
              files: ['/base/dir1/file1']
            },
            {
              files: ['/base/dir2/file2']
            }
          ])
          expect(objects).not.to.containSubset([{
              files: ['/base/dir3/file3']
            }
          ])
          done(error);
        }))
      })
      it('should use glob to match files', function(done) {
        db_scan(db, '/base/**/file1').pipe(StreamTest[version].toObjects((error, objects) => {

          expect(objects).to.containSubset([{
              files: ['/base/dir1/file1']
            }
          ])
          expect(objects).not.to.containSubset([{
              files: ['/base/dir2/file2']
            }
          ])
          done(error);
        }))
      })
    })
  })
})
