var miss = require('mississippi')

var fsScan = require('./fs_scan')
var fsLookup = require('./fs_lookup')
var dbLookup = require('./db_lookup')
var dbUpdate = require('./db_update')
var copy = require('./copy')
var remove = require('./remove')
var setTarget = require('./set_target')
var setStatus = require('./set_status')
module.exports = (params, db, exifFunction) => {
  return new Promise((resolve, reject) => miss.pipe(
    fsScan(params.paths),
    fsLookup.md5(),
    fsLookup.exif(exifFunction),
    dbLookup(db),
    setTarget(),
    copy(params.target, params.copy),
    remove(params.target, params.remove),
    setStatus(),
    dbUpdate(db),
    (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    }))
}
