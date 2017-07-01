var miss = require('mississippi')
var minimatch = require('minimatch')
var debug = require('debug')('filter_images')
module.exports = (patterns) => miss.through.obj((message, encoding, cb) => {
  debug(`mime ${message.exif.MIMEType} patterns ${patterns}`)
  if (message.exif.MIMEType && patterns.some((pattern) => minimatch(message.exif.MIMEType, pattern))) {
    cb(null, message)
  } else {
    cb()
  }
})
