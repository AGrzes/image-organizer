var expect = require('chai').expect
var setTarget = require('../set_target')
var StreamTest = require('streamtest')
describe('set_target', () => {
  StreamTest.versions.forEach(function (version) {
    describe('for ' + version + ' streams', function () {
      it('Should transform date and file name into target', (done) => {
        StreamTest[version].fromObjects([{
          file: 'source/file',
          exif: {
            FileModifyDate: '1234-12-21'
          }
        }]).pipe(setTarget()).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            target: '1234/12/21/file'
          }])
          done(error)
        }))
      })
    })
  })
})
