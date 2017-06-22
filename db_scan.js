var globParent = require('glob-parent')
var Ouch = require('ouch-stream')
var miss = require('mississippi')
var minimatch = require('minimatch')
var MultiStream = require('multistream')
var _ = require('lodash')
module.exports = (db, patterns, machine) => {
  return miss.pipeline.obj(MultiStream.obj(patterns.map(globParent).map((base) => new Ouch(db).view('db_scan/db_scan', {
    include_docs: true,
    limit_skip: true,
    startkey: [machine, base],
    endkey: [machine, base + '\uFFFF']
  }))), miss.through.obj((chunk, enc, cb) => cb(null, chunk.doc)), miss.through.obj(function (doc, enc, cb) {
    _(doc.files[machine]).pickBy((status, file) => patterns.some((pattern) => minimatch(file, pattern))).forEach((status, file) => {
      this.push({
        doc: doc,
        file: file,
        exif: doc.exif,
        machine: machine
      })
    })
    cb()
  }))
}
module.exports.initialize = (db) => {
  var viewDesign = {
    '_id': '_design/db_scan',
    'language': 'javascript',
    'views': {
      'db_scan': {
        'map': `
  function (doc) {
    if (doc.files) {
      for (var machine in doc.files) {
        for (var filePath in doc.files[machine]) {
          emit([machine,filePath])
        }
      }
    }
  }`
      }
    }
  }
  return db.put(viewDesign).catch((error) => {
    if (error.name === 'conflict') {
      return db.get(viewDesign._id).then((existing) => {
        viewDesign._rev = existing._rev
        return db.put(viewDesign)
      })
    } else {
      throw error
    }
  })
}
