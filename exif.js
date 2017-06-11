var Exif = require('simple-exiftool')
module.exports = (path) => new Promise((resolve, reject) => {
  Exif(path, (error, exif) => {
    if (error) {
      reject(error)
    } else {
      resolve(exif)
    }
  })
})
