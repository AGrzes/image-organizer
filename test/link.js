var mock = require('mock-fs')
var expect = require('chai').expect
var link = require('../link')
var StreamTest = require('streamtest')
var fs = require('fs')
describe('link', () => {
  beforeEach(() => {
    mock({
      '/exist': 'exist',
      '/target': 'target'
    })
  })
  afterEach(() => mock.restore())
  StreamTest.versions.forEach(function (version) {
    describe('for ' + version + ' streams', function () {
      it('should link to target file', function (done) {
        StreamTest[version].fromObjects([{
          file: '/source',
          target: 'target'
        }]).pipe(link('/', true)).pipe(StreamTest[version].toObjects((error) => {
          expect(fs.existsSync('/source')).to.be.true
          expect(fs.lstatSync('/source').isSymbolicLink()).to.be.true
          done(error)
        }))
      })

      it('Do nothing if disabled', function (done) {
        StreamTest[version].fromObjects([{
          file: '/source',
          target: 'target'
        }]).pipe(link('/', false)).pipe(StreamTest[version].toObjects((error) => {
          expect(fs.existsSync('/source')).to.be.false
          done(error)
        }))
      })

      it('should not link to non existing target', function (done) {
        StreamTest[version].fromObjects([{
          file: '/source',
          target: 'not-exist'
        }]).pipe(link('/', true)).pipe(StreamTest[version].toObjects((error) => {
          expect(fs.existsSync('/source')).to.be.false
          done(error)
        }))
      })

      it('should not override source', function (done) {
        StreamTest[version].fromObjects([{
          file: '/exist',
          target: 'target'
        }]).pipe(link('/', true)).pipe(StreamTest[version].toObjects((error) => {
          expect(fs.existsSync('/exist')).to.be.true
          expect(fs.lstatSync('/exist').isSymbolicLink()).to.be.false
          expect(fs.readFileSync('/exist', 'UTF-8')).to.be.equal('exist')
          done(error)
        }))
      })
    })
  })
})
