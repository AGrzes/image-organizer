var expect = require('chai').expect
var exifFunction = require('../../src/file/exif')
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
  it('Should fail on non existing file', (done) => {
    exifFunction('test/data/not-exist').catch(() => 'fail').then((exif) => {
      expect(exif).to.be.equal('fail')
      done()
    }).catch(done)
  })
})
