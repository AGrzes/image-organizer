var miss = require("mississippi");
var path = require("path");
var fs = require("fs");
var fse = require("fs-extra");
var debug = require("debug")("copy");
module.exports = (target) => miss.through.obj((message, enc, cb) => {
    var destination = path.join(target, message.target);
    fs.exists(message.file, (sourceExist) => {
        if (sourceExist) {
            fs.exists(destination, (exist) => {
                if (!exist) {
                    fse.copy(message.file, destination, (err) => {
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