#!/usr/bin/env node

var parameters = require('./parameters')()
var PouchDB = require('pouchdb-core')
var os = require('os')
var path = require('path')
var address = parameters.address
if (!address) {
  address = path.join(os.homedir(), '.image-organizer/db')
}
PouchDB.plugin(require('pouchdb-adapter-http')).plugin(require('pouchdb-mapreduce')).plugin(require('pouchdb-adapter-leveldb'))
require('../control/flow')(parameters, new PouchDB(address), require('../file/exif'), os.hostname())
