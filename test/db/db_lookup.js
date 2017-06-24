var dbLookup = require('../../src/db/db_lookup')
var expect = require('chai').use(require('chai-subset')).expect
var StreamTest = require('streamtest')
var PouchDB = require('pouchdb-core')
PouchDB.plugin(require('pouchdb-adapter-memory')).plugin(require('pouchdb-mapreduce'))
var db = new PouchDB('db_lookup', {
  adapter: 'memory'
})
describe('db_lookup', () => {
  before(() => {
    db.put({
      _id: 'md5'
    })
  })
  StreamTest.versions.forEach(function (version) {
    describe('for ' + version + ' streams', function () {
      it('should find document by md5', (done) => {
        StreamTest[version].fromObjects([{
          md5: 'md5'
        }]).pipe(dbLookup(db)).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            doc: {
              _id: 'md5'
            }
          }])
          done(error)
        }))
      })

      it('should construct document if not found', (done) => {
        StreamTest[version].fromObjects([{
          md5: '!md5'
        }]).pipe(dbLookup(db)).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            doc: {}
          }])
          done(error)
        }))
      })

      it('should initialize id if not found', (done) => {
        StreamTest[version].fromObjects([{
          md5: '!md5'
        }]).pipe(dbLookup(db)).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            doc: {
              _id: '!md5'
            }
          }])
          done(error)
        }))
      })

      it('should initialize files if not found', (done) => {
        StreamTest[version].fromObjects([{
          md5: '!md5',
          file: 'file',
          machine: 'machine'
        }]).pipe(dbLookup(db)).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            doc: {
              files: {
                machine: {
                  file: 'PRESENT'
                }
              }
            }
          }])
          done(error)
        }))
      })
      it('should initialize exif if not found', (done) => {
        StreamTest[version].fromObjects([{
          md5: '!md5',
          exif: 'exif'
        }]).pipe(dbLookup(db)).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            doc: {
              exif: 'exif'
            }
          }])
          done(error)
        }))
      })

      it('should add file to found document', (done) => {
        StreamTest[version].fromObjects([{
          md5: 'md5',
          file: 'file',
          machine: 'machine'
        }]).pipe(dbLookup(db)).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            doc: {
              _id: 'md5',
              files: {
                machine: {
                  file: 'PRESENT'
                }
              }
            }
          }])
          done(error)
        }))
      })

      it('should not pass message when md5 not provided', (done) => {
        StreamTest[version].fromObjects([{}]).pipe(dbLookup(db)).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).not.to.containSubset([{}])
          done(error)
        }))
      })
    })
  })
})
