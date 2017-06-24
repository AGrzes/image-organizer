var md5Stream = require('../../src/file/fs_lookup')
var expect = require('chai').use(require('chai-subset')).expect
var StreamTest = require('streamtest')
var mock = require('mock-fs')
describe('fs_lookup', () => {
  beforeEach(() => {
    mock({
      '/present': '',
      '/link': mock.symlink({
        path: '/present'
      })
    })
  })
  afterEach(() => {
    mock.restore()
  })
  StreamTest.versions.forEach(function (version) {
    describe('for ' + version + ' streams', function () {
      it('Should detect present file', (done) => {
        StreamTest[version].fromObjects([{
          file: '/present'
        }]).pipe(md5Stream()).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            status: 'PRESENT'
          }])
          done(error)
        }))
      })
      it('Should detect absent file', (done) => {
        StreamTest[version].fromObjects([{
          file: '/absent'
        }]).pipe(md5Stream()).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            status: 'ABSENT'
          }])
          done(error)
        }))
      })
      it('Should detect links', (done) => {
        StreamTest[version].fromObjects([{
          file: '/link'
        }]).pipe(md5Stream()).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            status: 'LINK'
          }])
          done(error)
        }))
      })
      it('Should discard invalid paths', (done) => {
        StreamTest[version].fromObjects([{
          file: '/present/file-under-file'
        }]).pipe(md5Stream()).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).not.to.containSubset([{}])
          done(error)
        }))
      })
    })
  })
})
