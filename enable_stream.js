var miss = require('mississippi')
module.exports = (stream, enabled) => enabled ? stream : miss.through()
module.exports.obj = (stream, enabled) => enabled ? stream : miss.through.obj()
