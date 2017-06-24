var mock = require('mock-fs')
var expect = require('chai').expect
var remove = require('../../src/file/remove')
var StreamTest = require('streamtest')
var fs = require('fs')
describe('remove', () => {
  beforeEach(() => {
    mock({
      '/source': 'source',
      '/target': 'target',
      '/protected': mock.directory({
        uid: 0,
        gid: 0,
        mode: 0,
        items: {
          file: 'file'
        }
      })
    })
  })
  afterEach(() => mock.restore())
  StreamTest.versions.forEach(function (version) {
    describe('for ' + version + ' streams', function () {
      it('should remove source file', function (done) {
        StreamTest[version].fromObjects([{
          file: '/source',
          target: 'target'
        }]).pipe(remove('/')).pipe(StreamTest[version].toObjects((error) => {
          expect(fs.existsSync('/source')).to.be.false
          done(error)
        }))
      })

      it('should set status to absent', function (done) {
        StreamTest[version].fromObjects([{
          file: '/source',
          target: 'target'
        }]).pipe(remove('/')).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            status: 'ABSENT'
          }])
          done(error)
        }))
      })

      it('should not set status to absent when remove failed', function (done) {
        StreamTest[version].fromObjects([{
          file: '/protected/file',
          target: 'target'
        }]).pipe(remove('/')).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).not.to.containSubset([{
            status: 'ABSENT'
          }])
          done(error)
        }))
      })

      it('should not remove when target does not exist', function (done) {
        StreamTest[version].fromObjects([{
          file: '/source',
          target: 'not-exist'
        }]).pipe(remove('/')).pipe(StreamTest[version].toObjects((error) => {
          expect(fs.existsSync('/source')).to.be.true
          done(error)
        }))
      })
    })
  })
})
