var miss = require('mississippi')
var debug = require('debug')('exif_stream')
module.exports = (exifFunction) => miss.through.obj((message, enc, cb) => {
  exifFunction(message.file).then((exif) => {
    message.exif = exif
    cb(null, message)
  }).catch((error) => {
    cb()
    debug(error)
  })
})
