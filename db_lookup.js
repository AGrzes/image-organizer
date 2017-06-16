var miss = require('mississippi')
var debug = require('debug')('db_lookup')
module.exports = (db) => miss.through.obj((message, enc, cb) => db.get(message.md5).then((doc) => {
  doc.files = doc.files || {}
  doc.files[message.machine] = doc.files[message.machine] || {}
  doc.files[message.machine][message.file] = 'PRESENT'
  message.doc = doc
}).then(() => cb(null, message)).catch((error) => {
  if (error.name === 'not_found') {
    message.doc = {
      _id: message.md5,
      exif: message.exif,
      files: {
        [message.machine]: {
          [message.file]: 'PRESENT'
        }
      }
    }
    cb(null, message)
  } else {
    debug(error)
    cb()
  }
}))
