var miss = require('mississippi')
var MultiStream = require('multistream')

var fsScan = require('./fs_scan')
var dbScan = require('./db_scan')
var md5Stream = require('./md5_stream')
var exifStream = require('./exif_stream')
var dbLookup = require('./db_lookup')
var fsLookup = require('./fs_lookup')
var dbUpdate = require('./db_update')
var copy = require('./copy')
var remove = require('./remove')
var link = require('./link')
var setTarget = require('./set_target')
var setStatus = require('./set_status')
var filterImages = require('./filter_images')
var enableStream = require('./enable_stream')
module.exports = (params, db, exifFunction) => {
  var fsPipeline = miss.pipeline.obj(enableStream.src.obj(fsScan(params.paths), !params.skipScan),
    md5Stream(),
    exifStream(exifFunction),
    filterImages(params.mime),
    dbLookup(db))
  var dbPipeline = miss.pipeline.obj(enableStream.src.obj(dbScan(db, params.paths), params.update), fsLookup())
  return new Promise((resolve, reject) => miss.pipe(
    MultiStream.obj([fsPipeline, dbPipeline]),
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
