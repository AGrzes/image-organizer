var md5File = require('md5-file/promise');
var miss = require('mississippi');
module.exports.md5 = () => miss.through.obj((message, enc, cb) => md5File(message.file).then((md5) => message.md5 = md5).then(() => cb(null, message)).catch((error) => {
    console.err(error);
}))