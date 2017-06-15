var gs = require('glob-stream')
var miss = require('mississippi')
module.exports = (pattern, machine) => miss.pipeline.obj(gs(pattern, {
  nodir: true,
  allowEmpty: true
}), miss.through.obj((chunk, enc, cb) => cb(null, {
  file: chunk.path,
  status: 'PRESENT',
  machine: machine
})))
