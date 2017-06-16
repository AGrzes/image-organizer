var fs = require('fs')
var fsOp = require('./fs_op')
var debug = require('debug')('remove')
module.exports = (target) => fsOp(target, (sourceExist, targetExist, message, destination, cb) => {
  if (sourceExist && targetExist) {
    debug(`removing ${message.file}`)
    fs.unlink(message.file, (err) => {
      if (!err) {
        message.status = 'ABSENT'
      }
      cb(err)
    })
  } else {
    cb()
  }
})
