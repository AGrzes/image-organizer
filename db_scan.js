var globParent = require("glob-parent");
var Ouch = require("ouch-stream");
var miss = require("mississippi");
var minimatch = require("minimatch");
module.exports = (db, pattern) => {
    var base = globParent(pattern);
    return miss.pipeline.obj(new Ouch(db).view((doc, emit) => {
        if (doc.files.some((file) => file.startsWith(base))) {
            emit(doc._id);
        }
    }, {
        include_docs: true
    }), miss.through.obj((chunk, enc, cb) => cb(null, chunk.doc)), miss.through.obj((doc, enc, cb) => {
        if (doc.files.some((file) => minimatch(file, pattern))) {
            cb(null, doc);
        } else {
            cb();
        }
    }));
};
