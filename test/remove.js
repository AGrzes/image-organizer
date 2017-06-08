var mock = require('mock-fs')
var expect = require('chai').expect
var remove = require('../remove')
var StreamTest = require('streamtest')
var fs = require('fs')
describe('remove', () => {
  beforeEach(() => {
    mock({
      '/source': 'source',
      '/target': 'target'
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
