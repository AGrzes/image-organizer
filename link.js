var fs = require('fs')
var fsOp = require('./fs_op')
module.exports = (target, enabled) => fsOp(target, enabled, (sourceExist, targetExist, source, destination, cb) => {
  if (!sourceExist && targetExist) {
    fs.symlink(destination, source, cb)
  } else {
    cb()
  }
})
