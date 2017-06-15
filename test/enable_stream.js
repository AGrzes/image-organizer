var expect = require('chai').expect
var enableStream = require('../enable_stream')
var miss = require('mississippi')
var StreamTest = require('streamtest')
describe('enable_stream', () => {
  StreamTest.versions.forEach(function (version) {
    describe('for ' + version + ' streams', function () {
      it('Should enable through object stream ', (done) => {
        StreamTest[version].fromObjects(['a']).pipe(enableStream.obj(miss.through.obj((message, encoding, cb) => {
          cb(null, 'z')
        }), true)).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.be.deep.equals(['z'])
          done(error)
        }))
      })
      it('Should disable through object stream ', (done) => {
        StreamTest[version].fromObjects(['a']).pipe(enableStream.obj(miss.through.obj((message, encoding, cb) => {
          cb(null, 'z')
        }), false)).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.be.deep.equals(['a'])
          done(error)
        }))
      })
      it('Should enable through stream ', (done) => {
        StreamTest[version].fromChunks(['a']).pipe(enableStream(miss.through((message, encoding, cb) => {
          cb(null, 'z')
        }), true)).pipe(StreamTest[version].toText((error, text) => {
          expect(text).to.be.equals('z')
          done(error)
        }))
      })
      it('Should disable through stream ', (done) => {
        StreamTest[version].fromChunks(['a']).pipe(enableStream(miss.through((message, encoding, cb) => {
          cb(null, 'z')
        }), false)).pipe(StreamTest[version].toText((error, text) => {
          expect(text).to.be.equals('a')
          done(error)
        }))
      })

      it('Should enable source object stream ', (done) => {
        enableStream.src.obj(StreamTest[version].fromObjects(['a']), true).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.be.deep.equals(['a'])
          done(error)
        }))
      })
      it('Should disable source object stream ', (done) => {
        enableStream.src.obj(StreamTest[version].fromObjects(['a']), false).pipe(StreamTest[version].toObjects((error, objects) => {
          expect(objects).to.be.deep.equals([])
          done(error)
        }))
      })
      it('Should enable source stream ', (done) => {
        enableStream.src(StreamTest[version].fromChunks(['a']), true).pipe(StreamTest[version].toText((error, text) => {
          expect(text).to.be.equals('a')
          done(error)
        }))
      })
      it('Should disable source stream ', (done) => {
        enableStream.src(StreamTest[version].fromChunks(['a']), false).pipe(StreamTest[version].toText((error, text) => {
          expect(text).to.be.equals('')
          done(error)
        }))
      })
    })
  })
})
