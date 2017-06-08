var Ouch = require('ouch-stream')
module.exports = (db) => new Ouch(db).merge((message, doc) => {
  if (doc) {
    Object.assign(doc.files, message.doc.files)
    return doc
  } else {
    return message.doc
  }
})
