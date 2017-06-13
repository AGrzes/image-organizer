var miss = require('mississippi')
var minimatch = require('minimatch')
module.exports = (patterns) => miss.through.obj((message, encoding, cb) => {
  if (patterns.some((pattern) => minimatch(message.exif.MIMEType, pattern))) {
    cb(null, message)
  } else {
    cb()
  }
})
