var expect = require('chai').use(require('chai-subset')).expect
var dbUpdate = require('../../src/db/db_update')
var StreamTest = require('streamtest')
var PouchDB = require('pouchdb-core')
PouchDB.plugin(require('pouchdb-adapter-memory')).plugin(require('pouchdb-mapreduce'))
var db = new PouchDB('db_update', {
  adapter: 'memory'
})
var miss = require('mississippi')

describe('db_scan', () => {
  StreamTest.versions.forEach(function (version) {
    describe('for ' + version + ' streams', function () {
      it('should save document', (done) => {
        miss.pipe(StreamTest[version].fromObjects([{
          doc: {
            _id: version + '_doc1'
          }
        }]), dbUpdate(db), (err) => {
          if (err) {
            done(err)
          } else {
            db.get(version + '_doc1').then(() => done()).catch(done)
          }
        })
      })
      it('should combine difirent files', (done) => {
        miss.pipe(StreamTest[version].fromObjects([{
          doc: {
            _id: version + '_doc2',
            files: {
              file1: 'PRESENT'
            }
          }
        }, {
          doc: {
            _id: version + '_doc2',
            files: {
              file2: 'PRESENT'
            }
          }
        }]), dbUpdate(db), (err) => {
          if (err) {
            done(err)
          } else {
            db.get(version + '_doc2').then((doc) => {
              expect(doc).to.containSubset({
                files: {
                  file1: 'PRESENT',
                  file2: 'PRESENT'
                }
              })
              done()
            }).catch(done)
          }
        })
      })
      it('should override the same file', (done) => {
        miss.pipe(StreamTest[version].fromObjects([{
          doc: {
            _id: version + '_doc3',
            files: {
              file1: 'PRESENT'
            }
          }
        }, {
          doc: {
            _id: version + '_doc3',
            files: {
              file1: 'ABSENT'
            }
          }
        }]), dbUpdate(db), (err) => {
          if (err) {
            done(err)
          } else {
            db.get(version + '_doc3').then((doc) => {
              expect(doc).to.containSubset({
                files: {
                  file1: 'ABSENT'
                }
              })
              done()
            }).catch(done)
          }
        })
      })
    })
  })
})
