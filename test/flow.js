var expect = require('chai').use(require('chai-subset')).expect
var flow = require('../flow')
var PouchDB = require('pouchdb-core')
PouchDB.plugin(require('pouchdb-adapter-memory')).plugin(require('pouchdb-mapreduce'))
var mock = require('mock-fs')
var db
var fs = require('fs')
var exifFunction = (path) => Promise.resolve({
  path: path,
  FileModifyDate: '1900-01-01'
})
describe('flow', () => {
  beforeEach(() => {
    db = new PouchDB('flow', {
      adapter: 'memory'
    })
    mock({
      '/source/empty': '',
      '/source/empty2': '',
      '/source/file1': 'file1'
    })
  })
  it('Should add file to db', (done) => {
    flow({
      paths: '/source/empty'
    }, db, exifFunction).then(() => db.get('d41d8cd98f00b204e9800998ecf8427e')).then((doc) => {
      expect(doc).to.containSubset({
        'files': {
          '/source/empty': 'PRESENT'
        }
      })
      done()
    }).catch(done)
  })
  it('Should file identical files under the same document', (done) => {
    flow({
      paths: ['/source/empty', '/source/empty2']
    }, db, exifFunction).then(() => db.get('d41d8cd98f00b204e9800998ecf8427e')).then((doc) => {
      expect(doc).to.containSubset({
        'files': {
          '/source/empty': 'PRESENT',
          '/source/empty2': 'PRESENT'
        }
      })
      done()
    }).catch(done)
  })
  it('Copy source file to target', (done) => {
    flow({
      paths: ['/source/file1'],
      copy: true,
      target: '/target'
    }, db, exifFunction).then(() => db.get('826e8142e6baabe8af779f5f490cf5f5')).then((doc) => {
      expect(doc).to.containSubset({
        'files': {
          '/source/file1': 'PRESENT'
        }
      })
      expect(fs.existsSync('/target/1900/01/01/file1')).to.be.true
      expect(fs.readFileSync('/target/1900/01/01/file1', 'UTF-8')).to.be.equal('file1')
      done()
    }).catch(done)
  })

  afterEach((done) => {
    db.destroy().then(() => done())
    mock.restore()
  })
})
