var gs = require('glob-stream')
var miss = require('mississippi')
module.exports = (pattern) => miss.pipeline.obj(gs(pattern, {
  nodir: true
}), miss.through.obj((chunk, enc, cb) => cb(null, {
  file: chunk.path
})))
