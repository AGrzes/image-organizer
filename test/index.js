var childProcess = require('child_process')
var expect = require('chai').expect
var PouchDB = require('pouchdb-core')
var os = require('os')
var fs = require('fs')
var path = require('path')
PouchDB.plugin(require('pouchdb-adapter-http'))

var waitForDb = (db) => new Promise((resolve, reject) => {
  var counter = 20
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
    FileModifyDate: '1234-12-21'
  }
}), db.put({
  _id: 'link',
  files: {
    [machine]: {
      [path.join(src, 'link')]: 'PRESENT'
    }
  },
  exif: {
    FileModifyDate: '1234-12-21'
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
  var pouchServer
  before(() => {
    pouchServer = childProcess.spawn('node_modules/.bin/pouchdb-server', ['--in-memory', '--port', '3000', '--config', './pouch-server-config.json'])
  })
  after((done) => {
    pouchServer.kill()
    pouchServer.on('exit', () => {
      done()
    })
  })
  var db
  var src
  var dst
  var machine = os.hostname()
  beforeEach((done) => {
    var tmpdir = path.join(os.tmpdir(), (new Date().getTime()).toString())
    fs.mkdirSync(tmpdir)
    src = path.join(tmpdir, 'src')
    dst = path.join(tmpdir, 'dst')
    db = new PouchDB('http://localhost:3000/test_db')
    Promise.all([copyDirectory('test/src', src), waitForDb(db).then(insertDocs(db, src, machine))]).then(() => done()).catch(done)
  })
  afterEach((done) => {
    db.destroy().then(() => done()).catch(done)
  })
  it('Should fail with no arguments', (done) => {
    childProcess.fork('./index', []).on('exit', (code) => {
      expect(code).not.to.be.equal(0)
      done()
    })
  })

  it('Should scan source directory', (done) => {
    childProcess.fork('./index', ['-a', 'http://localhost:3000/test_db', '-p', path.join(src, '**'), '-t', dst]).on('exit', (code) => {
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

  it('Should detect absent file', (done) => {
    childProcess.fork('./index', ['-a', 'http://localhost:3000/test_db', '-p', path.join(src, '**'), '-t', dst, '-x', '-u']).on('exit', (code) => {
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
    childProcess.fork('./index', ['-a', 'http://localhost:3000/test_db', '-p', path.join(src, '**'), '-t', dst, '-x', '-u']).on('exit', (code) => {
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
}).timeout(5000)
