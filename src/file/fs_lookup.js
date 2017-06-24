var miss = require('mississippi')
var fs = require('fs')
var debug = require('debug')('fs_lookup')
module.exports = () => miss.through.obj((message, enc, cb) => {
  fs.lstat(message.file, (err, stat) => {
    if (err) {
      if (err.code === 'ENOENT') {
        message.status = 'ABSENT'
        cb(null, message)
      } else {
        debug(err.code)
        cb()
      }
    } else {
      if (stat.isSymbolicLink()) {
        message.status = 'LINK'
      } else {
        message.status = 'PRESENT'
      }
      cb(null, message)
    }
  })
})
