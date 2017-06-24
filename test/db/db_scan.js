var expect = require('chai').use(require('chai-subset')).expect
var dbScan = require('../../src/db/db_scan')
var StreamTest = require('streamtest')
var PouchDB = require('pouchdb-core')
PouchDB.plugin(require('pouchdb-adapter-memory')).plugin(require('pouchdb-mapreduce'))
var db

describe('db_scan', () => {
  beforeEach((done) => {
    db = new PouchDB('db_scan_' + new Date().getTime(), {
      adapter: 'memory'
    })
    Promise.all([db.put({
      _id: 'file1',
      files: {
        'machine': {
          '/base/dir1/file1': 'PRESENT'
        }
      },
      exif: 'exif'
    }), db.put({
      _id: 'file2',
      files: {
        'machine': {
          '/base/dir2/file2': 'PRESENT'
        }
      }
    }), db.put({
      _id: 'file3',
      files: {
        'machine': {
          '/another/dir3/file3': 'PRESENT',
          '/another/dir3/file4': 'PRESENT'
        }
      }
    }), db.put({
      _id: 'another-machine-file1',
      files: {
        'another-machine': {
          '/base/dir1/file1': 'PRESENT'
        }
      },
      exif: 'exif'
    })]).then(() => done()).catch(done)
  })
  StreamTest.versions.forEach(function (version) {
    describe('for ' + version + ' streams', function () {
      beforeEach((done) => {
        dbScan.initialize(db).then(() => done()).catch(done)
      })
      it('should list all documents with file under base', function (done) {
        dbScan(db, ['/base/**'], 'machine').pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            doc: {
              files: {
                machine: {
                  '/base/dir1/file1': 'PRESENT'
                }
              }
            }
          }, {
            doc: {
              files: {
                machine: {
                  '/base/dir2/file2': 'PRESENT'
                }
              }
            }
          }])
          expect(objects).not.to.containSubset([{
            doc: {
              files: {
                machine: {
                  '/another/dir3/file3': 'PRESENT',
                  '/another/dir3/file4': 'PRESENT'
                }
              }
            }
          }])
          done(error)
        }))
      })
      it('should use glob to match files', function (done) {
        dbScan(db, ['/base/**/file1'], 'machine').pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            doc: {
              files: {
                machine: {
                  '/base/dir1/file1': 'PRESENT'
                }
              }
            }
          }])
          expect(objects).not.to.containSubset([{
            doc: {
              files: {
                machine: {
                  '/base/dir2/file2': 'PRESENT'
                }
              }
            }
          }])
          done(error)
        }))
      })
      it('should return one message per matching file in document', function (done) {
        dbScan(db, ['/another/**'], 'machine').pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            file: '/another/dir3/file3'
          }, {
            file: '/another/dir3/file4'
          }])
          done(error)
        }))
      })
      it('should populate message.exif', function (done) {
        dbScan(db, ['/base/dir1/file1'], 'machine').pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            exif: 'exif'
          }])
          done(error)
        }))
      })
      it('should populate message.machine', function (done) {
        dbScan(db, ['/base/dir1/file1'], 'machine').pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            machine: 'machine'
          }])
          done(error)
        }))
      })
      it('should find file for specific machine', function (done) {
        dbScan(db, ['/base/dir1/file1'], 'another-machine').pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            doc: {
              files: {
                'another-machine': {
                  '/base/dir1/file1': 'PRESENT'
                }
              }
            }
          }])
          expect(objects).not.to.containSubset([{
            doc: {
              files: {
                'machine': {
                  '/base/dir1/file1': 'PRESENT'
                }
              }
            }
          }])
          done(error)
        }))
      })
    })
  })

  describe('initialize', function () {
    it('should initialize db_scan view', function (done) {
      dbScan.initialize(db).then(() => db.get('_design/db_scan')).then((view) => {
        expect(view).to.have.nested.property('views.db_scan.map')
        expect(view.views.db_scan.map).to.have.string('function')
        done()
      }).catch(done)
    })
    it('should reinitialize db_scan view', function (done) {
      db.put({
        _id: '_design/db_scan'
      }).then(() => dbScan.initialize(db)).then(() => db.get('_design/db_scan')).then((view) => {
        expect(view).to.have.nested.property('views.db_scan.map')
        expect(view.views.db_scan.map).to.have.string('function')
        done()
      }).catch(done)
    })
    it('should bubble errors', function (done) {
      dbScan.initialize({
        put: () => Promise.reject(new Error('error'))
      }).catch((error) => error).then((error) => {
        expect(error.message).to.be.equals('error')
        done()
      }).catch(done)
    })
  })
})
