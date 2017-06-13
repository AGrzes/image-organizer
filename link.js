var fs = require('fs')
var fsOp = require('./fs_op')
module.exports = (target) => fsOp(target, (sourceExist, targetExist, message, destination, cb) => {
  if (!sourceExist && targetExist) {
    fs.symlink(destination, message.file, (err) => {
      if (!err) {
        message.status = 'LINK'
      }
      cb(err)
    })
  } else {
    cb()
  }
})
