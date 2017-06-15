var childProcess = require('child_process')
var expect = require('chai').expect
var PouchDB = require('pouchdb-core')
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
  beforeEach((done) => {
    db = new PouchDB('http://localhost:3000/test_db')
    var counter = 10
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
})
