var childProcess = require('child_process')
var expect = require('chai').expect
var PouchDB = require('pouchdb-core')
var os = require('os')
var fs = require('fs')
var path = require('path')
PouchDB.plugin(require('pouchdb-adapter-http'))
describe('index', () => {
  var pouchServer
  before(() => {
    pouchServer = childProcess.spawn('node_modules/.bin/pouchdb-server', ['--in-memory', '--port', '3000'])
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
    childProcess.spawn('cp', ['-r', 'test/src', src]).on('exit', (code) => {
      if (code === 0) {
        db = new PouchDB('http://localhost:3000/test_db')
        var counter = 20
        var wait = () => {
          db.allDocs().then(() => done()).catch((err) => {
            if (err.code === 'ECONNREFUSED' && counter-- > 0) {
              setTimeout(wait, 100)
            } else {
              done(err)
            }
          })
        }
        wait()
      } else {
        done(new Error(`Source directory copy failed 'cp', ['-r', 'test/src', ${src}]`))
      }
    })
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
}).timeout(5000)
