var miss = require('mississippi')

var fsScan = require('./fs_scan')
var fsLookup = require('./fs_lookup')
var dbLookup = require('./db_lookup')
var dbUpdate = require('./db_update')
module.exports = (params, db) => {
  return new Promise((resolve, reject) => miss.pipe(fsScan(params.paths), fsLookup.md5(), fsLookup.exif(), dbLookup(db), dbUpdate(db), (err) => {
    if (err) {
      reject(err)
    } else {
      resolve()
    }
  }))
}
