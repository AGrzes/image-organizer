var miss = require("mississippi");
var path = require("path");
var fs = require("fs");
var debug = require("debug")("remove");
module.exports = (target) => miss.through.obj((message, enc, cb) => {
    var destination = path.join(target, message.target);
    fs.exists(message.file, (sourceExist) => {
        if (sourceExist) {
            fs.exists(destination, (exist) => {
                if (exist) {
                    fs.unlink(message.file, (err) => {
                        if (err) {
                            debug(err);
                        }
                        cb(null, message);
                    });
                } else {
                    cb(null, message);
                }
            });
        } else {
            cb(null, message);
        }
    });
});