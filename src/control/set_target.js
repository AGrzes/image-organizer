var miss = require('mississippi')
var moment = require('moment')
var path = require('path')
var debug = require('debug')('set_target')
module.exports = () => miss.through.obj((message, encoding, cb) => {
  debug(message.exif.CreateDate)
  var date = moment(message.exif.CreateDate, 'YYYY:MM:DD HH:mm:ss')
  if (date.isValid()) {
    message.target = path.join(date.format('YYYY'), date.format('MM'), date.format('DD'), message.exif.FileName || path.basename(message.file))
    debug(message.target)
    cb(null, message)
  } else {
    cb()
  }
})
