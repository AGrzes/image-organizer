var expect = require('chai').expect
var parameters = require('../../src/cmd/parameters')
describe('parameters', () => {
  it('Should recognize short address', () => {
    var params = parameters(['-a', 'address', '-p', '**'])
    expect(params.address).to.be.equals('address')
  })
  it('Should recognize long address', () => {
    var params = parameters(['--address', 'address', '-p', '**'])
    expect(params.address).to.be.equals('address')
  })
  it('Should recognize short copy', () => {
    var params = parameters(['-c', '-p', '**', '-t', '**'])
    expect(params.copy).to.be.true
  })
  it('Should recognize long copy', () => {
    var params = parameters(['--copy', '-p', '**', '-t', '**'])
    expect(params.copy).to.be.true
  })
  it('Should demand target when copy enabled', () => {
    expect(() => parameters(['-c', '-p', '**'])).to.throw
  })
  it('Should recognize short remove', () => {
    var params = parameters(['-r', '-p', '**', '-t', '**'])
    expect(params.remove).to.be.true
  })
  it('Should recognize long remove', () => {
    var params = parameters(['--remove', '-p', '**', '-t', '**'])
    expect(params.remove).to.be.true
  })
  it('Should demand target when remove enabled', () => {
    expect(() => parameters(['-r', '-p', '**'])).to.throw
  })
  it('Should recognize short link', () => {
    var params = parameters(['-l', '-p', '**', '-t', '**'])
    expect(params.link).to.be.true
  })
  it('Should recognize long link', () => {
    var params = parameters(['--link', '-p', '**', '-t', '**'])
    expect(params.link).to.be.true
  })
  it('Should demand target when link enabled', () => {
    expect(() => parameters(['-l', '-p', '**'])).to.throw
  })
  it('Should recognize short update', () => {
    var params = parameters(['-u', '-p', '**', '-t', '**'])
    expect(params.update).to.be.true
  })
  it('Should recognize long update', () => {
    var params = parameters(['--update', '-p', '**', '-t', '**'])
    expect(params.update).to.be.true
  })
  it('Should recognize short skip-scan', () => {
    var params = parameters(['-x', '-p', '**', '-t', '**'])
    expect(params.skipScan).to.be.true
  })
  it('Should recognize long skip-scan', () => {
    var params = parameters(['--skip-scan', '-p', '**', '-t', '**'])
    expect(params.skipScan).to.be.true
  })
  it('Should recognize short mime', () => {
    var params = parameters(['-m', 'mime', '-p', '**'])
    expect(params.mime).to.be.deep.equals(['mime'])
  })
  it('Should recognize long mime', () => {
    var params = parameters(['--mime', 'mime', '-p', '**'])
    expect(params.mime).to.be.deep.equals(['mime'])
  })
  it('Should recognize multiple mime', () => {
    var params = parameters(['-m', 'mime', 'other-mime', '-p', '**'])
    expect(params.mime).to.be.deep.equals(['mime', 'other-mime'])
  })
  it('Should demand paths', () => {
    expect(() => parameters([])).to.throw
  })
  it('Should recognize short paths', () => {
    var params = parameters(['-p', 'paths'])
    expect(params.paths).to.be.deep.equals(['paths'])
  })
  it('Should recognize long paths', () => {
    var params = parameters(['--paths', 'paths'])
    expect(params.paths).to.be.deep.equals(['paths'])
  })
  it('Should recognize multiple paths', () => {
    var params = parameters(['-p', 'paths', 'other-paths'])
    expect(params.paths).to.be.deep.equals(['paths', 'other-paths'])
  })
  it('Should recognize short target', () => {
    var params = parameters(['-t', 'target', '-p', '**'])
    expect(params.target).to.be.equals('target')
  })
  it('Should recognize long target', () => {
    var params = parameters(['--target', 'target', '-p', '**'])
    expect(params.target).to.be.equals('target')
  })
  it('Should start in silent mode', () => {
    var params = parameters(['-p', '**'])
    expect(params.verbose).to.be.equals(0)
  })
  it('Should recognize verbose flag', () => {
    var params = parameters(['-p', '**', '-v'])
    expect(params.verbose).to.be.equals(1)
  })
  it('Should count verbose flags', () => {
    var params = parameters(['-p', '**', '-vvv'])
    expect(params.verbose).to.be.equals(3)
  })
})
