var md5File = require('md5-file/promise')
var miss = require('mississippi')
var debug = require('debug')('md5_stream')
module.exports = () => miss.through.obj((message, enc, cb) => md5File(message.file).then((md5) => {
  debug(md5)
  message.md5 = md5
}).then(() => cb(null, message)).catch((error) => {
  cb()
  debug(error)
}))
