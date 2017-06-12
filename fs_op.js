var miss = require('mississippi')
var path = require('path')
var fs = require('fs')
var debug = require('debug')('fs_op')
module.exports = (target, enabled, callback) => enabled ? miss.through.obj((message, enc, cb) => {
  var destination = path.join(target, message.target)
  fs.access(message.file, (err) => {
    var sourceExist = !err
    fs.access(destination, (err) => {
      var targetExist = !err
      debug(`sourceExist ${sourceExist} targetExist ${targetExist}`)
      callback(sourceExist, targetExist, message, destination, (err) => {
        if (err) {
          debug(err)
        }
        cb(err, message)
      })
    })
  })
}) : miss.through.obj()
