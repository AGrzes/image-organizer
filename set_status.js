var miss = require('mississippi')
module.exports = () => miss.through.obj((message, encoding, cb) => {
  message.doc.files[message.file] = message.status
  cb(null, message)
})
