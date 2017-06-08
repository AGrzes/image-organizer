var miss = require('mississippi')
var path = require('path')
var fs = require('fs')
var debug = require('debug')('fs_op')
module.exports = (target, callback) => miss.through.obj((message, enc, cb) => {
  var destination = path.join(target, message.target)
  fs.access(message.file, (err) => {
    var sourceExist = !err
    fs.access(destination, (err) => {
      var targetExist = !err
      callback(sourceExist, targetExist, message.file, destination, (err) => {
        if (err) {
          debug(err)
        }
        cb(err, message)
      })
    })
  })
})
