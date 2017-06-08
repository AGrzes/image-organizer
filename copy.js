var fse = require('fs-extra')
var fsOp = require('./fs_op')
module.exports = (target) => fsOp(target, (sourceExist, targetExist, source, destination, cb) => {
  if (sourceExist && !targetExist) {
    fse.copy(source, destination, cb)
  } else {
    cb()
  }
})
