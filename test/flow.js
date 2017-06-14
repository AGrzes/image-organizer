var expect = require('chai').use(require('chai-subset')).expect
var flow = require('../flow')
var PouchDB = require('pouchdb-core')
PouchDB.plugin(require('pouchdb-adapter-memory')).plugin(require('pouchdb-mapreduce'))
var mock = require('mock-fs')
var db
var fs = require('fs')
var path = require('path')
var exifFunction = (filePath) => Promise.resolve({
  path: filePath,
  FileModifyDate: '1900-01-01',
  MIMEType: path.extname(filePath)
})
describe('flow', () => {
  beforeEach((done) => {
    db = new PouchDB('flow' + new Date().getTime(), {
      adapter: 'memory'
    })
    mock({
      '/source/empty': '',
      '/source/empty2': '',
      '/source/file1': 'file1',
      '/source/exist': 'source-exist',
      '/target/1900/01/01/exist': 'exist',
      '/source/file.bad': 'bad'
    })
    Promise.all([db.put({
      _id: 'present',
      files: {
        '/source/file1': 'UNKNOWN'
      },
      exif: {
        path: '/source/file1',
        FileModifyDate: '1900-01-01',
        MIMEType: ''
      }
    }), db.put({
      _id: 'absent',
      files: {
        '/source/not-exist': 'UNKNOWN'
      },
      exif: {
        path: '/source/not-exist',
        FileModifyDate: '1900-01-01',
        MIMEType: ''
      }
    })]).then(() => done())
  })
  it('Should add file to db', (done) => {
    flow({
      paths: ['/source/empty'],
      mime: ['**']
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
      paths: ['/source/empty', '/source/empty2'],
      mime: ['**']
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
  it('Should copy source file to target', (done) => {
    flow({
      paths: ['/source/file1'],
      copy: true,
      target: '/target',
      mime: ['**']
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
  it('Should not copy source file when target exist', (done) => {
    flow({
      paths: ['/source/exist'],
      copy: true,
      target: '/target',
      mime: ['**']
    }, db, exifFunction).then(() => db.get('59d61554157b210bf431b40d57818b11')).then((doc) => {
      expect(doc).to.containSubset({
        'files': {
          '/source/exist': 'PRESENT'
        }
      })
      expect(fs.existsSync('/target/1900/01/01/exist')).to.be.true
      expect(fs.readFileSync('/target/1900/01/01/exist', 'UTF-8')).to.be.equal('exist')
      done()
    }).catch(done)
  })
  it('Should remove source when remove enabled and target exist', (done) => {
    flow({
      paths: ['/source/exist'],
      remove: true,
      target: '/target',
      mime: ['**']
    }, db, exifFunction).then(() => db.get('59d61554157b210bf431b40d57818b11')).then((doc) => {
      expect(doc).to.containSubset({
        'files': {
          '/source/exist': 'ABSENT'
        }
      })
      expect(fs.existsSync('/source/exist')).to.be.false
      expect(fs.existsSync('/target/1900/01/01/exist')).to.be.true
      expect(fs.readFileSync('/target/1900/01/01/exist', 'UTF-8')).to.be.equal('exist')
      done()
    }).catch(done)
  })
  it('Should not remove source when remove enabled and target not exist', (done) => {
    flow({
      paths: ['/source/file1'],
      remove: true,
      target: '/target',
      mime: ['**']
    }, db, exifFunction).then(() => db.get('826e8142e6baabe8af779f5f490cf5f5')).then((doc) => {
      expect(doc).to.containSubset({
        'files': {
          '/source/file1': 'PRESENT'
        }
      })
      expect(fs.existsSync('/source/file1')).to.be.true
      done()
    }).catch(done)
  })
  it('Should link when target exist and source is removed', (done) => {
    flow({
      paths: ['/source/exist'],
      remove: true,
      link: true,
      target: '/target',
      mime: ['**']
    }, db, exifFunction).then(() => db.get('59d61554157b210bf431b40d57818b11')).then((doc) => {
      expect(doc).to.containSubset({
        'files': {
          '/source/exist': 'LINK'
        }
      })
      expect(fs.existsSync('/source/exist')).to.be.true
      expect(fs.lstatSync('/source/exist').isSymbolicLink()).to.be.true
      expect(fs.existsSync('/target/1900/01/01/exist')).to.be.true
      expect(fs.readFileSync('/target/1900/01/01/exist', 'UTF-8')).to.be.equal('exist')
      done()
    }).catch(done)
  })
  it('Should not link when target exist and source is not removed', (done) => {
    flow({
      paths: ['/source/exist'],
      link: true,
      target: '/target',
      mime: ['**']
    }, db, exifFunction).then(() => db.get('59d61554157b210bf431b40d57818b11')).then((doc) => {
      expect(doc).to.containSubset({
        'files': {
          '/source/exist': 'PRESENT'
        }
      })
      expect(fs.existsSync('/source/exist')).to.be.true
      expect(fs.lstatSync('/source/exist').isSymbolicLink()).to.be.false
      expect(fs.existsSync('/target/1900/01/01/exist')).to.be.true
      expect(fs.readFileSync('/target/1900/01/01/exist', 'UTF-8')).to.be.equal('exist')
      done()
    }).catch(done)
  })
  it('Should filter out specified mime types', (done) => {
    flow({
      paths: ['/source/file.bad'],
      mime: ['!.bad']
    }, db, exifFunction).then(() => db.get('bae60998ffe4923b131e3d6e4c19993e')).then((doc) => {
      expect(doc).to.be.undefined
      done()
    }).catch((err) => {
      expect(err.message).to.be.equal('missing')
      done()
    }).catch(done)
  })
  it('Should disable file source', (done) => {
    flow({
      paths: ['/source/empty'],
      mime: ['**'],
      skipScan: true
    }, db, exifFunction).then(() => db.get('d41d8cd98f00b204e9800998ecf8427e')).then((doc) => {
      expect(doc).to.be.undefined
      done()
    }).catch((err) => {
      expect(err.message).to.be.equal('missing')
      done()
    }).catch(done)
  })
  it('Should confirm that file is present', (done) => {
    flow({
      paths: ['/source/file1'],
      mime: ['**'],
      skipScan: true,
      update: true
    }, db, exifFunction).then(() => db.get('present')).then((doc) => {
      expect(doc).to.containSubset({
        'files': {
          '/source/file1': 'PRESENT'
        }
      })
      done()
    }).catch(done)
  })
  it('Should confirm that file is absent', (done) => {
    flow({
      paths: ['/source/not-exist'],
      mime: ['**'],
      skipScan: true,
      update: true
    }, db, exifFunction).then(() => db.get('absent')).then((doc) => {
      expect(doc).to.containSubset({
        'files': {
          '/source/not-exist': 'ABSENT'
        }
      })
      done()
    }).catch(done)
  })
  afterEach(() => {
    mock.restore()
  })
})
