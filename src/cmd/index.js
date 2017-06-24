#!/usr/bin/env node
var parameters = require('./parameters')()
var PouchDB = require('pouchdb-core')
var os = require('os')
PouchDB.plugin(require('pouchdb-adapter-http')).plugin(require('pouchdb-mapreduce'))
require('../control/flow')(parameters, new PouchDB(parameters.adress), require('../file/exif'), os.hostname())
