var miss = require('mississippi')
var MultiStream = require('multistream')

var fsScan = require('../file/fs_scan')
var dbScan = require('../db/db_scan')
var md5Stream = require('../file/md5_stream')
var exifStream = require('../file/exif_stream')
var dbLookup = require('../db/db_lookup')
var fsLookup = require('../file/fs_lookup')
var dbUpdate = require('../db/db_update')
var copy = require('../file/copy')
var remove = require('../file/remove')
var link = require('../file/link')
var setTarget = require('./set_target')
var setStatus = require('./set_status')
var filterImages = require('./filter_images')
var enableStream = require('enable-stream')
var report = require('./report')
module.exports = (params, db, exifFunction, machine, logStream) => {
  var initialize = Promise.all([dbScan.initialize(db)])
  return initialize.then(() => new Promise((resolve, reject) => miss.pipe(
    MultiStream.obj([miss.pipeline.obj(enableStream.src.obj(() => fsScan(params.paths, machine), !params.skipScan),
      enableStream.obj(report(logStream), params.verbose >= 1),
      md5Stream(),
      exifStream(exifFunction),
      filterImages(params.mime),
      dbLookup(db)),
    miss.pipeline.obj(enableStream.src.obj(() => dbScan(db, params.paths, machine), params.update),
      enableStream.obj(report(logStream), params.verbose >= 1),
      fsLookup())]),
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
    })))
}
