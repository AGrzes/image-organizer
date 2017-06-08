var fs = require("fs");
var fs_op = require("./fs_op");
module.exports = (target) => fs_op(target, (sourceExist, targetExist, source, destination, cb) => {
    if (!sourceExist && targetExist) {
        fs.symlink(destination, source, cb);
    } else {
        cb();
    }
});
/*module.exports = (target) => miss.through.obj((message, enc, cb) => {
    var destination = path.join(target, message.target);
    fs.exists(message.file, (sourceExist) => {
        if (sourceExist) {
            cb(null, message);
        } else {
            fs.exists(destination, (exist) => {
                if (exist) {
                    fs.symlink(destination, message.file, (err) => {
                        if (err) {
                            debug(err);
                        }
                        cb(null, message);
                    });
                } else {
                    cb(null, message);
                }
            });
        }
    });
});*/