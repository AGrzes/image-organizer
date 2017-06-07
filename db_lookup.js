var miss = require("mississippi");
var debug = require("debug")("db_lookup");
module.exports = (db) => miss.through.obj((message, enc, cb) => db.get(message.md5).then((doc) => message.doc = doc).catch((error) => {
    if (error.name === "not_found") {
        message.doc = {
            _id: message.md5,
            exif: message.exif,
            files: {
                [message.file]: "PRESENT"
            }
        };
    } else {
        debug(error);
    }
}).then(() => cb(null, message)));