var fs_lookup = require('../fs_lookup');
var expect = require('chai').use(require('chai-subset')).expect;
var StreamTest = require('streamtest');
describe('fs_lookup', () => {
    StreamTest.versions.forEach(function (version) {
        describe('for ' + version + ' streams', function () {
            describe('md5', () => {
                it('should calculate md5', (done) => {
                    StreamTest[version].fromObjects([{
                        file: 'test/data/md5'
                    }]).pipe(fs_lookup.md5()).pipe(StreamTest[version].toObjects((error, objects) => {
                        expect(objects).to.containSubset([{
                            md5: 'd41d8cd98f00b204e9800998ecf8427e'
                        }])
                        done(error);
                    }))
                })
            })
            describe('mime', () => {
                it('should recognize png', (done) => {
                    StreamTest[version].fromObjects([{
                        file: 'test/data/png'
                    }]).pipe(fs_lookup.mime()).pipe(StreamTest[version].toObjects((error, objects) => {
                        expect(objects).to.containSubset([{
                            mime: 'image/png'
                        }])
                        done(error);
                    }))
                })
                it('should recognize jpg', (done) => {
                    StreamTest[version].fromObjects([{
                        file: 'test/data/jpg'
                    }]).pipe(fs_lookup.mime()).pipe(StreamTest[version].toObjects((error, objects) => {
                        expect(objects).to.containSubset([{
                            mime: 'image/jpeg'
                        }])
                        done(error);
                    }))
                })
            })
            describe('exif', () => {
                it('should analyze png', (done) => {
                    StreamTest[version].fromObjects([{
                        file: 'test/data/png'
                    }]).pipe(fs_lookup.exif()).pipe(StreamTest[version].toObjects((error, objects) => {
                        expect(objects).to.containSubset([{
                            exif: {
                                MIMEType: 'image/png',
                                ImageHeight: 1,
                                ImageWidth: 1
                            }
                        }])
                        done(error);
                    }))
                })
                it('should analyze jpg', (done) => {
                    StreamTest[version].fromObjects([{
                        file: 'test/data/jpg'
                    }]).pipe(fs_lookup.exif()).pipe(StreamTest[version].toObjects((error, objects) => {
                        expect(objects).to.containSubset([{
                            exif: {
                                MIMEType: 'image/jpeg',
                                ImageHeight: 1,
                                ImageWidth: 1
                            }
                        }])
                        done(error);
                    }))
                })
            })
        })
    })
})