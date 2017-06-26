var fse = require('fs-extra')
var fsOp = require('./fs_op')
var moment = require('moment')
module.exports = (target) => fsOp(target, (sourceExist, targetExist, message, destination, cb) => {
  if (sourceExist && !targetExist) {
    fse.copy(message.file, destination, (error) => {
      if (error) {
        cb(error)
      } else {
        var date = moment(message.exif.CreateDate, 'YYYY:MM:DD HH:mm:ss')
        fse.utimes(destination, new Date(), date.toDate(), cb)
      }
    })
  } else {
    cb()
  }
})
