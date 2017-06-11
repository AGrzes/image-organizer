var expect = require('chai').expect
var exifFunction = require('../exif')
describe('exif', () => {
  it('Should recognize jpg', (done) => {
    exifFunction('test/data/jpg').then((exif) => {
      expect(exif).to.containSubset({
        MIMEType: 'image/jpeg'
      })
      done()
    }).catch(done)
  })

  it('Should recognize png', (done) => {
    exifFunction('test/data/png').then((exif) => {
      expect(exif).to.containSubset({
        MIMEType: 'image/png'
      })
      done()
    }).catch(done)
  })
})
