var miss = require('mississippi')

var fsScan = require('./fs_scan')
var md5Stream = require('./md5_stream')
var exifStream = require('./exif_stream')
var dbLookup = require('./db_lookup')
var dbUpdate = require('./db_update')
var copy = require('./copy')
var remove = require('./remove')
var link = require('./link')
var setTarget = require('./set_target')
var setStatus = require('./set_status')
var filterImages = require('./filter_images')
var enableStream = require('./enable_stream')
module.exports = (params, db, exifFunction) => {
  return new Promise((resolve, reject) => miss.pipe(
    fsScan(params.paths),
    md5Stream(),
    exifStream(exifFunction),
    filterImages(params.mime),
    dbLookup(db),
    setTarget(),
    enableStream.obj(copy(params.target), params.copy),
    enableStream.obj(remove(params.target), params.remove),
    enableStream.obj(link(params.target), params.link),
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
