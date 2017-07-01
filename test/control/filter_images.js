var expect = require('chai').expect
var filterImages = require('../../src/control/filter_images')
var StreamTest = require('streamtest')
describe('filter_images', () => {
  StreamTest.versions.forEach(function (version) {
    describe('for ' + version + ' streams', function () {
      it('Should filter images with mime matching patterns', (done) => {
        StreamTest[version].fromObjects([{
          exif: {
            MIMEType: 'match'
          }
        }, {
          exif: {
            MIMEType: 'not-match'
          }
        }]).pipe(filterImages(['match'])).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.be.deep.equals([{
            exif: {
              MIMEType: 'match'
            }
          }])
          done(error)
        }))
      })
      it('Should accept multiple patterns', (done) => {
        StreamTest[version].fromObjects([{
          exif: {
            MIMEType: 'match'
          }
        }, {
          exif: {
            MIMEType: 'not-match'
          }
        }]).pipe(filterImages(['match', 'not-match'])).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.be.deep.equals([{
            exif: {
              MIMEType: 'match'
            }
          }, {
            exif: {
              MIMEType: 'not-match'
            }
          }])
          done(error)
        }))
      })
      it('Should apply wildcards', (done) => {
        StreamTest[version].fromObjects([{
          exif: {
            MIMEType: 'match'
          }
        }, {
          exif: {
            MIMEType: 'not-match'
          }
        }]).pipe(filterImages(['*match'])).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.be.deep.equals([{
            exif: {
              MIMEType: 'match'
            }
          }, {
            exif: {
              MIMEType: 'not-match'
            }
          }])
          done(error)
        }))
      })
      it('Should reject undefined', (done) => {
        StreamTest[version].fromObjects([{
          exif: {
            MIMEType: 'match'
          }
        }, {
          exif: {
            MIMEType: undefined,
            flag: 'not-match'
          }
        }]).pipe(filterImages(['**'])).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.be.deep.equals([{
            exif: {
              MIMEType: 'match'
            }
          }])
          expect(objects).not.to.be.deep.equals([{
            exif: {
              flag: 'not-match'
            }
          }])
          done(error)
        }))
      })
    })
  })
})
