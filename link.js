var fs = require('fs')
var fsOp = require('./fs_op')
module.exports = (target) => fsOp(target, (sourceExist, targetExist, message, destination, cb) => {
  if (!sourceExist && targetExist) {
    fs.symlink(destination, message.file, cb)
  } else {
    cb()
  }
})
