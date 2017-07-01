var miss = require('mississippi')
module.exports = (logStream) => miss.through.obj((message, encoding, cb) => {
  logStream.write(`Processing ${message.machine}:${message.file}\n`)
  cb(null, message)
}, (cb) => {
  logStream.end()
  cb()
})
