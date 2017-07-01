var expect = require('chai').expect
var report = require('../../src/control/report')
var devNull = require('dev-null')
var StreamTest = require('streamtest')
describe('set_target', () => {
  StreamTest.versions.forEach(function (version) {
    describe('for ' + version + ' streams', function () {
      it('should report file', (done) => {
        StreamTest[version].toText()
        StreamTest[version].fromObjects([{
          file: 'file',
          machine: 'machine'
        }]).pipe(report(StreamTest[version].toText((error, text) => {
          expect(text).to.be.equals('Processing machine:file\n')
          done(error)
        }))).pipe(devNull({
          objectMode: true
        }))
      })
      it('should report every file', (done) => {
        StreamTest[version].toText()
        StreamTest[version].fromObjects([{
          file: 'file1',
          machine: 'machine'
        }, {
          file: 'file2',
          machine: 'machine'
        }]).pipe(report(StreamTest[version].toText((error, text) => {
          expect(text).to.be.equals('Processing machine:file1\nProcessing machine:file2\n')
          done(error)
        }))).pipe(devNull({
          objectMode: true
        }))
      })
    })
  })
})
