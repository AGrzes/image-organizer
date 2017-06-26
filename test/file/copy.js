var mock = require('mock-fs')
var expect = require('chai').use(require('chai-datetime')).expect
var copy = require('../../src/file/copy')
var StreamTest = require('streamtest')
var fs = require('fs')
var moment = require('moment')
describe('copy', () => {
  beforeEach(() => {
    mock({
      '/source': 'source',
      '/exist': 'exist'
    })
  })
  afterEach(() => mock.restore())
  StreamTest.versions.forEach(function (version) {
    describe('for ' + version + ' streams', function () {
      it('should copy file', function (done) {
        StreamTest[version].fromObjects([{
          file: '/source',
          target: 'target',
          exif: {}
        }]).pipe(copy('/')).pipe(StreamTest[version].toObjects((error) => {
          expect(fs.existsSync('/target')).to.be.true
          expect(fs.readFileSync('/target', 'UTF-8')).to.be.equal('source')
          done(error)
        }))
      })
      it('should set the file modification time to creation time', function (done) {
        StreamTest[version].fromObjects([{
          exif: {
            CreateDate: '2000-12-21'
          },
          file: '/source',
          target: 'target'
        }]).pipe(copy('/')).pipe(StreamTest[version].toObjects((error) => {
          expect(fs.existsSync('/target')).to.be.true
          expect(fs.statSync('/target').mtime).to.be.equalTime(moment('2000-12-21').toDate())
          done(error)
        }))
      })

      it('should not override existing file', function (done) {
        StreamTest[version].fromObjects([{
          file: '/source',
          target: 'exist',
          exif: {}
        }]).pipe(copy('/')).pipe(StreamTest[version].toObjects((error) => {
          expect(fs.existsSync('/exist')).to.be.true
          expect(fs.readFileSync('/exist', 'UTF-8')).to.be.equal('exist')
          done(error)
        }))
      })
      it('should skip missing source', function (done) {
        StreamTest[version].fromObjects([{
          file: '/not-exist',
          target: 'target',
          exif: {}
        }]).pipe(copy('/')).pipe(StreamTest[version].toObjects((error) => {
          expect(fs.existsSync('/target')).to.be.false
          done(error)
        }))
      })
    })
  })
})
