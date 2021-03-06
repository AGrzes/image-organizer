var childProcess = require('child_process')
var expect = require('chai').expect
var PouchDB = require('pouchdb-core')
var os = require('os')
var fs = require('fs')
var fse = require('fs-extra')
var path = require('path')
PouchDB.plugin(require('pouchdb-adapter-http'))

var waitForDb = (db) => new Promise((resolve, reject) => {
  var counter = 30
  var wait = () => {
    db.allDocs().then(() => resolve(db)).catch((err) => {
      if (err.code === 'ECONNREFUSED' && counter-- > 0) {
        setTimeout(wait, 100)
      } else {
        reject(err)
      }
    })
  }
  wait()
})

var insertDocs = (db, src, machine) => () => Promise.all([db.put({
  _id: 'absent',
  files: {
    [machine]: {
      [path.join(src, 'absent')]: 'PRESENT'
    }
  },
  exif: {
    CreateDate: '1234:12:21'
  }
}), db.put({
  _id: 'link',
  files: {
    [machine]: {
      [path.join(src, 'link')]: 'PRESENT'
    }
  },
  exif: {
    CreateDate: '1234:12:21'
  }
}), db.put({
  _id: 'file1.jpg',
  files: {
    [machine]: {
      [path.join(src, 'file1.jpg')]: 'PRESENT'
    }
  },
  exif: {
    CreateDate: '1234:12:21'
  }
})])

var copyDirectory = (src, dst) => new Promise((resolve, reject) => {
  childProcess.spawn('cp', ['-r', src, dst]).on('exit', (code) => {
    if (code === 0) {
      resolve()
    } else {
      reject(new Error(`Source directory copy failed 'cp', ['-r', ${src}, ${dst}]`))
    }
  })
})

describe('index', function () {
  this.timeout(5000)
  var pouchServer
  before(() => {
    pouchServer = childProcess.spawn(path.join(__dirname, '..', '..', 'node_modules/.bin/pouchdb-server'), ['--in-memory', '--port', '3000', '--config', path.join(__dirname, 'pouch-server-config.json')])
  })
  after(function (done) {
    pouchServer.kill()
    pouchServer.on('exit', () => {
      done()
    })
  })
  var db
  var src
  var dst
  var machine = os.hostname()
  beforeEach(function (done) {
    var tmpdir = path.join(os.tmpdir(), (new Date().getTime()).toString())
    fs.mkdirSync(tmpdir)
    src = path.join(tmpdir, 'src')
    dst = path.join(tmpdir, 'dst')
    fs.mkdirSync(dst)
    db = new PouchDB('http://localhost:3000/test_db')
    Promise.all([copyDirectory(path.join(__dirname, 'src'), src), waitForDb(db).then(insertDocs(db, src, machine))]).then(() => done()).catch(done)
  })
  afterEach(function (done) {
    db.destroy().then(() => done()).catch(done)
  })
  it('Should fail with no arguments', (done) => {
    childProcess.fork(path.join(__dirname, '..', '..', 'src', 'cmd', 'index'), []).on('exit', (code) => {
      expect(code).not.to.be.equal(0)
      done()
    })
  })

  it('Should scan source directory', (done) => {
    childProcess.fork(path.join(__dirname, '..', '..', 'src', 'cmd', 'index'), ['-a', 'http://localhost:3000/test_db', '-p', path.join(src, '**'), '-t', dst]).on('exit', (code) => {
      db.allDocs({
        include_docs: true
      }).then((docs) => {
        expect(docs).to.be.containSubset({
          rows: [{
            doc: {
              files: {
                [machine]: {
                  [path.join(src, 'file1.jpg')]: 'PRESENT'
                }
              }
            }
          }]
        })
        done()
      }).catch(done)
    })
  })

  it('Should detect duplicates', (done) => {
    childProcess.fork(path.join(__dirname, '..', '..', 'src', 'cmd', 'index'), ['-a', 'http://localhost:3000/test_db', '-p', path.join(src, '**'), '-t', dst]).on('exit', (code) => {
      db.allDocs({
        include_docs: true
      }).then((docs) => {
        expect(docs).to.be.containSubset({
          rows: [{
            doc: {
              files: {
                [machine]: {
                  [path.join(src, 'file1.jpg')]: 'PRESENT',
                  [path.join(src, 'duplicate', 'file1.jpg')]: 'PRESENT'
                }
              }
            }
          }]
        })
        done()
      }).catch(done)
    })
  })

  it('Should copy source files', (done) => {
    childProcess.fork(path.join(__dirname, '..', '..', 'src', 'cmd', 'index'), ['-a', 'http://localhost:3000/test_db', '-p', path.join(src, '**'), '-t', dst, '-c']).on('exit', (code) => {
      expect(fs.existsSync(path.join(dst, '2000', '05', '06', 'file1.jpg'))).to.be.true
      done()
    })
  })

  it('Should remove source files after copy', (done) => {
    childProcess.fork(path.join(__dirname, '..', '..', 'src', 'cmd', 'index'), ['-a', 'http://localhost:3000/test_db', '-p', path.join(src, '**'), '-t', dst, '-c', '-r']).on('exit', (code) => {
      expect(fs.existsSync(path.join(dst, '2000', '05', '06', 'file1.jpg'))).to.be.true
      expect(fs.existsSync(path.join(src, 'file1.jpg'))).to.be.false
      done()
    })
  })

  it('Should link source files after remove', (done) => {
    childProcess.fork(path.join(__dirname, '..', '..', 'src', 'cmd', 'index'), ['-a', 'http://localhost:3000/test_db', '-p', path.join(src, '**'), '-t', dst, '-c', '-r', '-l']).on('exit', (code) => {
      expect(fs.existsSync(path.join(dst, '2000', '05', '06', 'file1.jpg'))).to.be.true
      expect(fs.existsSync(path.join(src, 'file1.jpg'))).to.be.true
      expect(fs.lstatSync(path.join(src, 'file1.jpg')).isSymbolicLink()).to.be.true
      expect(fs.realpathSync(path.join(src, 'file1.jpg'))).to.be.equals(path.join(dst, '2000', '05', '06', 'file1.jpg'))
      done()
    })
  })

  it('Should link source files after remove db driven', (done) => {
    childProcess.fork(path.join(__dirname, '..', '..', 'src', 'cmd', 'index'), ['-a', 'http://localhost:3000/test_db', '-p', path.join(src, '**'), '-t', dst, '-c', '-r', '-l', '-x', '-u']).on('exit', (code) => {
      expect(fs.existsSync(path.join(dst, '1234', '12', '21', 'file1.jpg'))).to.be.true
      expect(fs.existsSync(path.join(src, 'file1.jpg'))).to.be.true
      expect(fs.lstatSync(path.join(src, 'file1.jpg')).isSymbolicLink()).to.be.true
      expect(fs.realpathSync(path.join(src, 'file1.jpg'))).to.be.equals(path.join(dst, '1234', '12', '21', 'file1.jpg'))
      done()
    })
  })
  it('Should use local db when not provided address', (done) => {
    fse.emptyDirSync(path.join(os.homedir(), '.image-organizer'))
    childProcess.fork(path.join(__dirname, '..', '..', 'src', 'cmd', 'index'), ['-p', path.join(src, '**'), '-t', dst]).on('exit', (code) => {
      if (code) {
        done(new Error(`image-organizer exited with code ${code}`))
      } else {
        childProcess.fork(path.join(__dirname, '..', '..', 'src', 'cmd', 'index'), ['-p', path.join(src, '**'), '-t', dst, '-c', '-r', '-l', '-x', '-u']).on('exit', (code) => {
          if (code) {
            done(new Error(`image-organizer exited with code ${code}`))
          } else {
            expect(fs.existsSync(path.join(dst, '2000', '05', '06', 'file1.jpg'))).to.be.true
            expect(fs.existsSync(path.join(src, 'file1.jpg'))).to.be.true
            expect(fs.lstatSync(path.join(src, 'file1.jpg')).isSymbolicLink()).to.be.true
            expect(fs.realpathSync(path.join(src, 'file1.jpg'))).to.be.equals(path.join(dst, '2000', '05', '06', 'file1.jpg'))
            done()
          }
        })
      }
    })
  })

  it('Should detect absent file', (done) => {
    childProcess.fork(path.join(__dirname, '..', '..', 'src', 'cmd', 'index'), ['-a', 'http://localhost:3000/test_db', '-p', path.join(src, '**'), '-t', dst, '-x', '-u']).on('exit', (code) => {
      db.allDocs({
        include_docs: true
      }).then((docs) => {
        expect(docs).to.be.containSubset({
          rows: [{
            doc: {
              _id: 'absent',
              files: {
                [machine]: {
                  [path.join(src, 'absent')]: 'ABSENT'
                }
              }
            }
          }]
        })
        done()
      }).catch(done)
    })
  })

  it('Should detect links', (done) => {
    childProcess.fork(path.join(__dirname, '..', '..', 'src', 'cmd', 'index'), ['-a', 'http://localhost:3000/test_db', '-p', path.join(src, '**'), '-t', dst, '-x', '-u']).on('exit', (code) => {
      db.allDocs({
        include_docs: true
      }).then((docs) => {
        expect(docs).to.be.containSubset({
          rows: [{
            doc: {
              _id: 'link',
              files: {
                [machine]: {
                  [path.join(src, 'link')]: 'LINK'
                }
              }
            }
          }]
        })
        done()
      }).catch(done)
    })
  })
})
