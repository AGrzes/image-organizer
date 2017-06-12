var fse = require('fs-extra')
var fsOp = require('./fs_op')
var debug = require('debug')('remove')
module.exports = (target, enabled) => fsOp(target, enabled, (sourceExist, targetExist, message, destination, cb) => {
  if (sourceExist && targetExist) {
    debug(`removing ${message.file}`)
    fse.unlink(message.file, (err) => {
      if (!err) {
        message.status = 'ABSENT'
      }
      cb(err)
    })
  } else {
    cb()
  }
})
