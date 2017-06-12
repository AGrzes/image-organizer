var exifStream = require('../exif_stream')
var expect = require('chai').use(require('chai-subset')).expect
var StreamTest = require('streamtest')
describe('fs_lookup', () => {
  StreamTest.versions.forEach(function (version) {
    describe('for ' + version + ' streams', function () {
      it('should analyze file using provided function', (done) => {
        StreamTest[version].fromObjects([{
          file: 'test/data/png'
        }]).pipe(exifStream((path) => Promise.resolve('DUMMY'))).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            exif: 'DUMMY'
          }])
          done(error)
        }))
      })
    })
  })
})
