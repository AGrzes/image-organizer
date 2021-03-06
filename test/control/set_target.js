var expect = require('chai').expect
var setTarget = require('../../src/control/set_target')
var StreamTest = require('streamtest')
describe('set_target', () => {
  StreamTest.versions.forEach(function (version) {
    describe('for ' + version + ' streams', function () {
      it('Should transform date and file name into target', (done) => {
        StreamTest[version].fromObjects([{
          file: 'source/file',
          exif: {
            CreateDate: '1234-12-21'
          }
        }]).pipe(setTarget()).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            target: '1234/12/21/file'
          }])
          done(error)
        }))
      })
      it('Should use exif filename if known', (done) => {
        StreamTest[version].fromObjects([{
          file: 'source/file',
          exif: {
            CreateDate: '1234-12-21',
            FileName: 'another'
          }
        }]).pipe(setTarget()).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            target: '1234/12/21/another'
          }])
          done(error)
        }))
      })
      it('Should skip element when failed to calculate target', (done) => {
        StreamTest[version].fromObjects([{
          file: 'source/file',
          exif: {
            CreateDate: 'XXX'
          }
        }]).pipe(setTarget()).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).not.to.containSubset([{
            file: 'source/file'
          }])
          done(error)
        }))
      })
    })
  })
})
