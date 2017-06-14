var expect = require('chai').use(require('chai-subset')).expect
var dbScan = require('../db_scan')
var StreamTest = require('streamtest')
var PouchDB = require('pouchdb-core')
PouchDB.plugin(require('pouchdb-adapter-memory')).plugin(require('pouchdb-mapreduce'))
var db = new PouchDB('db_scan', {
  adapter: 'memory'
})

describe('db_scan', () => {
  before(() => {
    db.put({
      _id: 'file1',
      files: {
        '/base/dir1/file1': 'PRESENT'
      },
      exif: 'exif'
    })
    db.put({
      _id: 'file2',
      files: {
        '/base/dir2/file2': 'PRESENT'
      }
    })
    db.put({
      _id: 'file3',
      files: {
        '/another/dir3/file3': 'PRESENT',
        '/another/dir3/file4': 'PRESENT'
      }
    })
  })
  StreamTest.versions.forEach(function (version) {
    describe('for ' + version + ' streams', function () {
      it('should list all documents with file under base', function (done) {
        dbScan(db, '/base/**').pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            doc: {
              files: {
                '/base/dir1/file1': 'PRESENT'
              }
            }
          }, {
            doc: {
              files: {
                '/base/dir2/file2': 'PRESENT'
              }
            }
          }])
          expect(objects).not.to.containSubset([{
            doc: {
              files: {
                '/another/dir3/file3': 'PRESENT',
                '/another/dir3/file4': 'PRESENT'
              }
            }
          }])
          done(error)
        }))
      })
      it('should use glob to match files', function (done) {
        dbScan(db, '/base/**/file1').pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            doc: {
              files: {
                '/base/dir1/file1': 'PRESENT'
              }
            }
          }])
          expect(objects).not.to.containSubset([{
            doc: {
              files: {
                '/base/dir2/file2': 'PRESENT'
              }
            }
          }])
          done(error)
        }))
      })
      it('should return one message per matching file in document', function (done) {
        dbScan(db, '/another/**').pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            file: '/another/dir3/file3'
          }, {
            file: '/another/dir3/file4'
          }])
          done(error)
        }))
      })
      it('should populate message.exif', function (done) {
        dbScan(db, '/base/dir1/file1').pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            exif: 'exif'
          }])
          done(error)
        }))
      })
    })
  })
})
