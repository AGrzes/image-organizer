var debug = require('debug')('db_update')
var Ouch = require('ouch-stream')
module.exports = (db) => new Ouch(db).merge((message, doc) => {
  debug(`Message ${message.doc} Doc ${doc}`)
  if (doc) {
    Object.assign(doc.files, message.doc.files)
    return doc
  } else {
    return message.doc
  }
})
