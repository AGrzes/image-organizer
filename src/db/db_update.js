var debug = require('debug')('db_update')
var Ouch = require('ouch-stream')
module.exports = (db) => new Ouch(db).merge((message, doc) => {
  debug(`Message ${message.doc} Doc ${doc}`)
  if (doc) {
    for (const machine in message.doc.files) {
      Object.assign(doc.files[machine] || {}, message.doc.files[machine])
    }
    return doc
  } else {
    return message.doc
  }
})
