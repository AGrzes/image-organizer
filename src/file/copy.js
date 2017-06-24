var fse = require('fs-extra')
var fsOp = require('./fs_op')
module.exports = (target) => fsOp(target, (sourceExist, targetExist, message, destination, cb) => {
  if (sourceExist && !targetExist) {
    fse.copy(message.file, destination, cb)
  } else {
    cb()
  }
})
