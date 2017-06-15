var globParent = require('glob-parent')
var Ouch = require('ouch-stream')
var miss = require('mississippi')
var minimatch = require('minimatch')
var _ = require('lodash')
module.exports = (db, patterns, machine) => {
  var bases = patterns.map(globParent)
  return miss.pipeline.obj(new Ouch(db).view((doc, emit) => {
    if (_.some(doc.files[machine], (status, file) => bases.some((base) => file.startsWith(base)))) {
      emit(doc._id)
    }
  }, {
    include_docs: true
  }), miss.through.obj((chunk, enc, cb) => cb(null, chunk.doc)), miss.through.obj(function (doc, enc, cb) {
    _(doc.files[machine]).pickBy((status, file) => patterns.some((pattern) => minimatch(file, pattern))).forEach((status, file) => {
      this.push({
        doc: doc,
        file: file,
        exif: doc.exif
      })
    })
    cb()
  }))
}
