var parameters = require('./parameters')
var PouchDB = require('pouchdb-core')
PouchDB.plugin(require('pouchdb-adapter-http')).plugin(require('pouchdb-mapreduce'))
require('./flow')(parameters, new PouchDB(parameters.adress), require('./exif'))
