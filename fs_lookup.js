var md5File = require('md5-file/promise');
var miss = require('mississippi');
var mime = require('mime');
module.exports.md5 = () => miss.through.obj((message, enc, cb) => md5File(message.file).then((md5) => message.md5 = md5).then(() => cb(null, message)).catch((error) => {
    console.error(error);
}))

module.exports.mime = () => miss.through.obj((message, enc, cb) => {
    message.mime = mime.lookup(message.file)
    cb(null, message);
})