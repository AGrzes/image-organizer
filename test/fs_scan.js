var expect = require('chai').expect
var fsScan = require('../fs_scan')
var StreamTest = require('streamtest')
var mock = require('mock-fs')
describe('fs_scan', () => {
  before(() => {
    mock({
      '/base/dir1/file1': '',
      '/base/dir2/file2': '',
      '/another/dir3/file3': ''
    })
  })
  after(() => mock.restore())
  StreamTest.versions.forEach(function (version) {
    describe('for ' + version + ' streams', function () {
      it('should list all files under base', function (done) {
        fsScan('/base/**').pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.be.deep.equals([{
            file: '/base/dir1/file1'
          },
          {
            file: '/base/dir2/file2'
          }
          ])
          done(error)
        }))
      })
    })
  })
})
