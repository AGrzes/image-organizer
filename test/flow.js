var expect = require('chai').use(require('chai-subset')).expect
var flow = require('../flow')
var PouchDB = require('pouchdb-core')
PouchDB.plugin(require('pouchdb-adapter-memory')).plugin(require('pouchdb-mapreduce'))
var mock = require('mock-fs')
var db
describe('flow', () => {
  beforeEach(() => {
    db = new PouchDB('flow', {
      adapter: 'memory'
    })
    mock({
      '/source/empty': ''
    })
  })
  it('Should add file to db', (done) => {
    flow({
      paths: '/source/**'
    }, db).then(() => db.get('d41d8cd98f00b204e9800998ecf8427e')).then((doc) => {
      expect(doc).to.containSubset({
        'files': {
          '/source/empty': 'PRESENT'
        }
      })
      done()
    }).catch(done)
  })
  afterEach((done) => {
    db.destroy().then(() => done())
    mock.restore()
  })
})
