var expect = require('chai').expect
var report = require('../../src/control/report')
var devNull = require('dev-null')
var miss = require('mississippi')
var StreamTest = require('streamtest')
describe('report', () => {
  StreamTest.versions.forEach(function (version) {
    describe('for ' + version + ' streams', function () {
      it('should report file', (done) => {
        var testStream = StreamTest[version].toText((error, text) => {
          expect(text).to.be.equals('Processing machine:file\n')
          done(error)
        })
        miss.pipe(StreamTest[version].fromObjects([{
          file: 'file',
          machine: 'machine'
        }]), report(testStream), devNull({
          objectMode: true
        }), (error) => {
          if (error) {
            done(error)
          } else {
            testStream.end()
          }
        })
      })
      it('should report every file', (done) => {
        var testStream = StreamTest[version].toText((error, text) => {
          expect(text).to.be.equals('Processing machine:file1\nProcessing machine:file2\n')
          done(error)
        })
        miss.pipe(StreamTest[version].fromObjects([{
          file: 'file1',
          machine: 'machine'
        }, {
          file: 'file2',
          machine: 'machine'
        }]), report(testStream), devNull({
          objectMode: true
        }), (error) => {
          if (error) {
            done(error)
          } else {
            testStream.end()
          }
        })
      })
    })
  })
})
