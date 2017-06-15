var expect = require('chai').expect
var setStatus = require('../set_status')
var StreamTest = require('streamtest')
describe('set_target', () => {
  StreamTest.versions.forEach(function (version) {
    describe('for ' + version + ' streams', function () {
      it('Should set file status', (done) => {
        StreamTest[version].fromObjects([{
          file: 'file',
          doc: {
            files: {}
          },
          status: 'status',
          machine: 'machine'
        }]).pipe(setStatus()).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.containSubset([{
            doc: {
              files: {
                machine: {
                  file: 'status'
                }
              }
            }
          }])
          done(error)
        }))
      })
    })
  })
})
