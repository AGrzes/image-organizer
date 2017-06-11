var md5File = require('md5-file/promise')
var miss = require('mississippi')
var mime = require('mime')
var debug = require('debug')('fs_lookup')
module.exports.md5 = () => miss.through.obj((message, enc, cb) => md5File(message.file).then((md5) => {
  debug(md5)
  message.md5 = md5
}).then(() => cb(null, message)).catch((error) => {
  cb()
  debug(error)
}))

module.exports.mime = () => miss.through.obj((message, enc, cb) => {
  message.mime = mime.lookup(message.file)
  cb(null, message)
})

module.exports.exif = (exifFunction) => miss.through.obj((message, enc, cb) => {
  exifFunction(message.file).then((exif) => {
    message.exif = exif
    cb(null, message)
  }).catch((error) => {
    cb()
    debug(error)
  })
})
