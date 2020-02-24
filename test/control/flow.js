var expect = require('chai').use(require('chai-subset')).expect
var flow = require('../../src/control/flow')
var PouchDB = require('pouchdb-core')
PouchDB.plugin(require('pouchdb-adapter-memory')).plugin(require('pouchdb-mapreduce'))
var mock = require('mock-fs')
var devNull = require('dev-null')
var db
var fs = require('fs')
var path = require('path')
var StreamTest = require('streamtest')
var exifFunction = (filePath) => Promise.resolve({
  path: filePath,
  CreateDate: '1900-01-01',
  MIMEType: 'MIMEType' + path.extname(filePath)
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
      '/source/file.bad': 'bad',
      '/source/link': mock.symlink({
        path: '/present'
      })
    })
    Promise.all([db.put({
      _id: 'present',
      files: {
        machine: {
          '/source/file1': 'UNKNOWN'
        }
      },
      exif: {
        path: '/source/file1',
        CreateDate: '1900-01-01',
        MIMEType: 'MIMEType'
      }
    }), db.put({
      _id: 'absent',
      files: {
        machine: {
          '/source/not-exist': 'UNKNOWN'
        }
      },
      exif: {
        path: '/source/not-exist',
        CreateDate: '1900-01-01',
        MIMEType: 'MIMEType'
      }
    }), db.put({
      _id: 'link',
      files: {
        machine: {
          '/source/link': 'UNKNOWN'
        }
      },
      exif: {
        path: '/source/link',
        CreateDate: '1900-01-01',
        MIMEType: 'MIMEType'
      }
    })]).then(() => done())
  })
  it('Should handle errors', (done) => {
    flow({
      paths: ['/source/empty'],
      mime: ['**']
    }, db, () => {
      throw new Error()
    }, 'machine', devNull()).catch(() => 'error').then((error) => {
      expect(error).to.be.equals('error')
      done()
    }).catch(done)
  })
  it('Should add file to db', (done) => {
    flow({
      paths: ['/source/empty'],
      mime: ['**']
    }, db, exifFunction, 'machine', devNull()).then(() => db.get('d41d8cd98f00b204e9800998ecf8427e')).then((doc) => {
      expect(doc).to.containSubset({
        files: {
          machine: {
            '/source/empty': 'PRESENT'
          }
        }
      })
      done()
    }).catch(done)
  })
  it('Should file identical files under the same document', (done) => {
    flow({
      paths: ['/source/empty', '/source/empty2'],
      mime: ['**']
    }, db, exifFunction, 'machine', devNull()).then(() => db.get('d41d8cd98f00b204e9800998ecf8427e')).then((doc) => {
      expect(doc).to.containSubset({
        files: {
          machine: {
            '/source/empty': 'PRESENT',
            '/source/empty2': 'PRESENT'
          }
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
    }, db, exifFunction, 'machine', devNull()).then(() => db.get('826e8142e6baabe8af779f5f490cf5f5')).then((doc) => {
      expect(doc).to.containSubset({
        files: {
          machine: {
            '/source/file1': 'PRESENT'
          }
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
    }, db, exifFunction, 'machine', devNull()).then(() => db.get('59d61554157b210bf431b40d57818b11')).then((doc) => {
      expect(doc).to.containSubset({
        files: {
          machine: {
            '/source/exist': 'PRESENT'
          }
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
    }, db, exifFunction, 'machine', devNull()).then(() => db.get('59d61554157b210bf431b40d57818b11')).then((doc) => {
      expect(doc).to.containSubset({
        files: {
          machine: {
            '/source/exist': 'ABSENT'
          }
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
    }, db, exifFunction, 'machine', devNull()).then(() => db.get('826e8142e6baabe8af779f5f490cf5f5')).then((doc) => {
      expect(doc).to.containSubset({
        files: {
          machine: {
            '/source/file1': 'PRESENT'
          }
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
    }, db, exifFunction, 'machine', devNull()).then(() => db.get('59d61554157b210bf431b40d57818b11')).then((doc) => {
      expect(doc).to.containSubset({
        files: {
          machine: {
            '/source/exist': 'LINK'
          }
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
    }, db, exifFunction, 'machine', devNull()).then(() => db.get('59d61554157b210bf431b40d57818b11')).then((doc) => {
      expect(doc).to.containSubset({
        files: {
          machine: {
            '/source/exist': 'PRESENT'
          }
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
      mime: ['!MIMEType.bad']
    }, db, exifFunction, 'machine', devNull()).then(() => db.get('bae60998ffe4923b131e3d6e4c19993e')).then((doc) => {
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
    }, db, exifFunction, 'machine', devNull()).then(() => db.get('d41d8cd98f00b204e9800998ecf8427e')).then((doc) => {
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
    }, db, exifFunction, 'machine', devNull()).then(() => db.get('present')).then((doc) => {
      expect(doc).to.containSubset({
        files: {
          machine: {
            '/source/file1': 'PRESENT'
          }
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
    }, db, exifFunction, 'machine', devNull()).then(() => db.get('absent')).then((doc) => {
      expect(doc).to.containSubset({
        files: {
          machine: {
            '/source/not-exist': 'ABSENT'
          }
        }
      })
      done()
    }).catch(done)
  })
  it('Should confirm that file is link', (done) => {
    flow({
      paths: ['/source/link'],
      mime: ['**'],
      skipScan: true,
      update: true
    }, db, exifFunction, 'machine', devNull()).then(() => db.get('link')).then((doc) => {
      expect(doc).to.containSubset({
        files: {
          machine: {
            '/source/link': 'LINK'
          }
        }
      })
      done()
    }).catch(done)
  })
  StreamTest.versions.forEach(function (version) {
    describe('for ' + version + ' streams', function () {
      it('Should log progress', (done) => {
        var testStream = StreamTest[version].toText((error, text) => {
          expect(text).to.be.equals('Processing machine:/source/empty\n')
          done(error)
        })
        flow({
          paths: ['/source/empty'],
          mime: ['**'],
          verbose: 1
        }, db, exifFunction, 'machine', testStream).then(() => testStream.end()).catch(done)
      })
    })
  })
  afterEach(() => {
    mock.restore()
  })
})
