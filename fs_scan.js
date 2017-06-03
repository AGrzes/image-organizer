var vfs = require('vinyl-fs');

module.exports = (basedir) => vfs.src([basedir])
