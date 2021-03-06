var mock = require('mock-fs')
var expect = require('chai').expect
var link = require('../../src/file/link')
var StreamTest = require('streamtest')
var fs = require('fs')
describe('link', () => {
  beforeEach(() => {
    mock({
      '/exist': 'exist',
      '/target': 'target',
      '/protected': mock.directory({
        uid: 0,
        gid: 0,
        mode: 0
      })
    })
  })
  afterEach(() => mock.restore())
  StreamTest.versions.forEach(function (version) {
    describe('for ' + version + ' streams', function () {
      it('should link to target file', function (done) {
        StreamTest[version].fromObjects([{
          file: '/source',
          target: 'target'
        }]).pipe(link('/')).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            status: 'LINK'
          }])
          expect(fs.existsSync('/source')).to.be.true
          expect(fs.lstatSync('/source').isSymbolicLink()).to.be.true
          done(error)
        }))
      })

      it('should not set status when link failed', function (done) {
        StreamTest[version].fromObjects([{
          file: '/protected/source',
          target: 'target'
        }]).pipe(link('/')).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).not.to.containSubset([{
            status: 'LINK'
          }])
          expect(fs.existsSync('/protected/source')).to.be.false
          done(error)
        }))
      })

      it('should not link to non existing target', function (done) {
        StreamTest[version].fromObjects([{
          file: '/source',
          target: 'not-exist',
          status: 'STATUS'
        }]).pipe(link('/')).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            status: 'STATUS'
          }])
          expect(fs.existsSync('/source')).to.be.false
          done(error)
        }))
      })

      it('should not override source', function (done) {
        StreamTest[version].fromObjects([{
          file: '/exist',
          target: 'target',
          status: 'STATUS'
        }]).pipe(link('/')).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            status: 'STATUS'
          }])
          expect(fs.existsSync('/exist')).to.be.true
          expect(fs.lstatSync('/exist').isSymbolicLink()).to.be.false
          expect(fs.readFileSync('/exist', 'UTF-8')).to.be.equal('exist')
          done(error)
        }))
      })
    })
  })
})
