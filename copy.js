var fse = require('fs-extra')
var fsOp = require('./fs_op')
module.exports = (target, enabled) => fsOp(target, enabled, (sourceExist, targetExist, source, destination, cb) => {
  if (sourceExist && !targetExist) {
    fse.copy(source, destination, cb)
  } else {
    cb()
  }
})
