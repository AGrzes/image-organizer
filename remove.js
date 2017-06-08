var fse = require("fs-extra");
var fs_op = require("./fs_op");
module.exports = (target) => fs_op(target, (sourceExist, targetExist, source, destination, cb) => {
    if (sourceExist && targetExist) {
        fse.unlink(source, cb);
    } else {
        cb();
    }
});