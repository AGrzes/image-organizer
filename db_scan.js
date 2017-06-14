var globParent = require('glob-parent')
var Ouch = require('ouch-stream')
var miss = require('mississippi')
var minimatch = require('minimatch')
var _ = require('lodash')
module.exports = (db, pattern) => {
  var base = globParent(pattern)
  return miss.pipeline.obj(new Ouch(db).view((doc, emit) => {
    if (_.some(doc.files, (status, file) => file.startsWith(base))) {
      emit(doc._id)
    }
  }, {
    include_docs: true
  }), miss.through.obj((chunk, enc, cb) => cb(null, chunk.doc)), miss.through.obj(function (doc, enc, cb) {
    _(doc.files).pickBy((status, file) => minimatch(file, pattern)).forEach((status, file) => {
      this.push({
        doc: doc,
        file: file,
        exif: doc.exif
      })
    })
    cb()
  }))
}
