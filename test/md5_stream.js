var md5Stream = require('../md5_stream')
var expect = require('chai').use(require('chai-subset')).expect
var StreamTest = require('streamtest')
describe('md5_stream', () => {
  StreamTest.versions.forEach(function (version) {
    describe('for ' + version + ' streams', function () {
      it('should calculate md5', (done) => {
        StreamTest[version].fromObjects([{
          file: 'test/data/md5'
        }]).pipe(md5Stream()).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            md5: 'd41d8cd98f00b204e9800998ecf8427e'
          }])
          done(error)
        }))
      })
      it('should fail gracefully', (done) => {
        StreamTest[version].fromObjects([{
          file: 'test/data/!md5'
        }]).pipe(md5Stream()).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).not.to.containSubset([{
            file: 'test/data/!md5'
          }])
          done(error)
        }))
      })
    })
  })
})
