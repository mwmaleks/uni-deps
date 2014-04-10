

var   expect = require('chai').expect
    , Path = require('path')
    , fs = require('fs')
    , rootDir  = process.cwd()
    , parseDeps = require('./../../lib/uni-deps').parseDeps
    , searchDeps = require('./../../lib/uni-deps').searchDeps
    , getContent = require('./../../lib/uni-deps').getContent
    , createDepsFile = require('./../../lib/uni-deps').createDepsFile
    , parseRules = require('./../../lib/parse-rules')
    , extDepsEncoder = require('./../../lib/encoders').extDepsEncoder
    , PathsHash = require('./../../lib/paths-hash')
    , utils = require('./../../lib/utils')
    ;
/**
 * Joins path string with rootDir
 * @param _path
 * @returns {*}
 */
function pathJoin(_path) {
    return Path.join(rootDir, _path);
}

require('mocha');

describe('Function parseDeps', function() {

    it('should be defined and be a function', function() {
        expect(parseDeps).not.be.defined;
        expect(parseDeps).to.be.a('function');
    });
    it('should accept two params "content" as sting and, "parseRule" as string equals to name of ' +
        'pre defined  parse rule function ' +
        'and throw error if passed params are not valid', function() {

        expect(function() {
            parseDeps(0, undefined)
        }).to.throw(/Incorrect parameters: it should be parse rule function and content type String/);

        expect(function() {
            parseDeps('some content', function() {} )
        }).not.to.throw;
    });
    it('should throw error if parseRule function returns not valid result. ' +
        'The result should be an array of paths to files' +
        'or empty array', function() {
        expect(function() { parseDeps('some content', function() { return null;})})
            .to.throw(/parseRule function returns incorrect result. It should be and array of valid path to file/);
        expect(function() { parseDeps('some content', function() { return [];})}).not.to.throw;
        expect(function() { parseDeps('some content', function() { return ['',''];})})
            .to.throw(/parseRule function returns incorrect result. It should be and array of valid path to file/);
    });
});


describe('Function getContent', function() {
    it('should be defined and be a function', function(done) {
       expect(getContent).to.be.defined;
       expect(getContent).to.be.a('function');
       getContent('/test/sample/sample.js', function(conntent) {
           expect(conntent).to.be.a('string');
           done();
       });
    });
});

describe('Function defaultDepsEncoder', function() {
   it('should be defined and be a function', function() {

       expect(extDepsEncoder).to.be.defined;
       expect(extDepsEncoder).to.be.a('function');
   });
   it('should return a stringified json ready to write to file from array of ext.js dependencies', function() {

       getContent('test/sample/extjs-app.js', function(content) {

           expect(extDepsEncoder(parseRules['extJs4ParseRule'](content))).to.eql(['ext/app/Controller.js']);

       });
   });
});

describe('Function createDepsFile', function() {

    it('should be defined and be a function', function() {
        expect(createDepsFile).to.be.defined;
        expect(createDepsFile).to.be.a('function');
    });
    it('should create file test.deps.json with valid json content ', function(done) {

        getContent('test/sample/extjs-app.js', function(content) {

            createDepsFile({
                path: pathJoin('test/sample/extjs-app.json'),
                pathsArray: extDepsEncoder(parseRules['extJs4ParseRule'](content)),
                callback: function(err) {

                    var data;
                    if (err) {
                        done(err);
                    }
                    data = fs.readFileSync(pathJoin('test/sample/extjs-app.deps.json'))
                        .toString();
                    if (data === '{ "files": [ \r\n' +
                        '"ext/app/Controller.js"\r\n] }') {
                        done();
                        return;
                    }
                    done(new Error('createDepsFile has written incorrect data to deps file'));
                }
            });

        });
    });
});


describe('Function jsonWrapper', function() {


    it('should be defined and be a function', function() {

        expect(utils.jsonWrapper).to.be.defined;
        expect(utils.jsonWrapper).to.be.a('function');
    });
    it('should return json string ready to be written into json file. Accepts array of paths',
        function() {

        expect(utils.jsonWrapper(['/var/user/tmp.123', '/etc/aaa/123.js']), null)
            .to.equal('{ \"files\": [ \r\n\"/var/user/tmp.123\",\r\n\"/etc/aaa/123.js\"\r\n] }');
    });
});
describe('PathsHash', function() {

    it('should be defined and be a function', function() {

        expect(PathsHash).to.be.defined;
        expect(PathsHash).to.be.a('function');
    });

    it('an instance of PathsHash should have ' +
        'method addDependant witch adds to the object reversed dependencies links', function() {

        var pathsHash = new PathsHash();

        expect(pathsHash).to.have.property('addDependant');
        expect(pathsHash.addDependant).to.be.a('function');

        pathsHash.addDependant('K1', ['K7', 'K4', 'K5','K8', 'K6', 'K3']);
        pathsHash.addDependant('K2', ['K4', 'K5', 'K9','K3']);
        pathsHash.addDependant('K3', ['K7', 'K5', 'K6']);
        pathsHash.addDependant('K4', ['K5', 'K3', 'K6']);

        expect(pathsHash.K1.weight).to.equal(6);
        expect(pathsHash.K2.weight).to.equal(4);
        expect(pathsHash.K3.weight).to.equal(3);

        expect(pathsHash.K7.dependant).to.eql(['K1', 'K3']);
        expect(pathsHash.K6.dependant).to.eql([ 'K1', 'K3', 'K4' ]);
        expect(pathsHash.K9.dependant).to.eql([ 'K2' ]);
        expect(pathsHash.K3.dependant).to.eql([ 'K1', 'K2', 'K4' ]);
        expect(pathsHash.K5.dependant).to.eql([ 'K1', 'K2', 'K3', 'K4' ]);
        expect(pathsHash.K4.dependant).to.eql([ 'K1', 'K2' ]);

    });
    it('an instance of PathsHash should have method distributeDependantWeights', function() {

        var pathsHash = new PathsHash();

        pathsHash.addDependant('K1', ['K7', 'K4', 'K5','K8', 'K6', 'K3']);
        pathsHash.addDependant('K2', ['K4', 'K5', 'K9','K3']);
        pathsHash.addDependant('K3', ['K7', 'K5', 'K6']);
        pathsHash.addDependant('K4', ['K5', 'K3', 'K6']);

        expect(pathsHash).to.have.property('distributeDependantWeights');
        expect(pathsHash.distributeDependantWeights).to.be.a('function');
        pathsHash.distributeDependantWeights();

        expect(pathsHash.K1.weight).to.equal(15);
        expect(pathsHash.K2.weight).to.equal(13);
        expect(pathsHash.K4.weight).to.equal(6);
        expect(pathsHash.K3.weight).to.equal(3);

        /* the same as above */
//        expect(pathsHash.K7.dependant).to.eql(['K1', 'K3']);
//        expect(pathsHash.K6.dependant).to.eql([ 'K1', 'K3', 'K4' ]);
//        expect(pathsHash.K9.dependant).to.eql([ 'K2' ]);
//        expect(pathsHash.K3.dependant).to.eql([ 'K1', 'K2', 'K4' ]);
//        expect(pathsHash.K5.dependant).to.eql([ 'K1', 'K2', 'K3', 'K4' ]);
//        expect(pathsHash.K4.dependant).to.eql([ 'K1', 'K2' ]);

    });
    it('should have method sortDependencies', function() {
        var pathsHash = new PathsHash();
        expect(pathsHash).to.have.property('sortDependencies');
        expect(pathsHash.sortDependencies).to.be.a('function');
    });
    it('should sortDependencies method sort dependencies by weight', function() {

        var pathsHash = new PathsHash();

        pathsHash.addDependant('K1', ['K7', 'K4', 'K5','K8', 'K6', 'K3']);
        pathsHash.addDependant('K2', ['K4', 'K5', 'K9','K3']);
        pathsHash.addDependant('K3', ['K7', 'K5', 'K6']);
        pathsHash.addDependant('K4', ['K5', 'K3', 'K6']);

        expect(pathsHash).to.have.property('distributeDependantWeights');
        expect(pathsHash.distributeDependantWeights).to.be.a('function');
        expect(pathsHash.distributeDependantWeights().sortDependencies().pathsArr).to.eql(
            [ { path: 'K7', weight: 0 },
            { path: 'K5', weight: 0 },
            { path: 'K8', weight: 0 },
            { path: 'K6', weight: 0 },
            { path: 'K9', weight: 0 },
            { path: 'K3', weight: 3 },
            { path: 'K4', weight: 6 },
            { path: 'K2', weight: 13 },
            { path: 'K1', weight: 15 } ]
        );

    });
    it('should have method saveJointFile', function() {
        var pathsHash = new PathsHash();
        expect(pathsHash).to.have.property('saveJointFile');
        expect(pathsHash.saveJointFile).to.be.a('function');
    });
    it('should save file common.deps.json with provided content', function(done) {

        var pathsHash = new PathsHash();

        pathsHash.addDependant('K1', ['K7', 'K4', 'K5','K8', 'K6', 'K3']);
        pathsHash.addDependant('K2', ['K4', 'K5', 'K9','K3']);
        pathsHash.addDependant('K3', ['K7', 'K5', 'K6']);
        pathsHash.addDependant('K4', ['K5', 'K3', 'K6']);
        pathsHash.distributeDependantWeights()
            .sortDependencies()
            .saveJointFile({
                baseDir: 'test/sample',
                ext: '.jsonp'
            }, function(err) {

                if (err) {
                    done(err);
                    return;
                }
                fs.readFile(Path.join(rootDir, 'test/sample', 'common.deps.jsonp'), function(err, data) {

                    if (err) {
                        done(err);
                        return;
                    }
                    expect(data.toString()).to.equal('{ "files": [ \r\n' +
                        '"K7",\r\n' +
                        '"K5",\r\n' +
                        '"K8",\r\n' +
                        '"K6",\r\n' +
                        '"K9",\r\n' +
                        '"K3",\r\n' +
                        '"K4",\r\n' +
                        '"K2",\r\n' +
                        '"K1"\r\n] }'
                    );
                    done();
                });
            });
    });
});

describe('Function searchDeps', function() {

    it('should be defined and be a function', function() {
        expect(searchDeps).to.be.defined;
        expect(searchDeps).to.be.a('function');
    });
    it('should read file from path provided in arguments ' +
        'and parse it with parseRule function if provided or with defaultRule function ' +
        'recursively processing its result. Also function should create deps file if' +
        ' dependencies are found', function(done) {

        searchDeps('test/sample/extjs-app.js', {
            baseDir: pathJoin('test/sample')
        }, function(paths, result) {
            expect(result.pathsArr).to.eql([
                { path: pathJoin('test/sample/ext/app/domain/Global.js'),
                    weight: 0 },
                { path: pathJoin('test/sample/ext/app/EventDomain.js'),
                    weight: 0 },
                { path: pathJoin('test/sample/ext/app/domain/Component.js'),
                    weight: 1 },
                { path: pathJoin('test/sample/ext/app/domain/Store.js'),
                    weight: 1 },
                { path: pathJoin('test/sample/ext/app/Controller.js'),
                    weight: 5 },
                { path: pathJoin('/test/sample/extjs-app.js'),
                    weight: 6 } ]);

            fs.readFile(pathJoin('test/sample/common.deps.json'), function(err, data) {

                if (err) {
                    done(err);
                    return;
                }
                expect(data.toString()).to.equal('{ "files": [ \r\n' +
                '"'+ rootDir +'/test/sample/ext/app/domain/Global.js",\r\n' +
                '"'+ rootDir +'/test/sample/ext/app/EventDomain.js",\r\n' +
                '"'+ rootDir +'/test/sample/ext/app/domain/Component.js",\r\n' +
                '"'+ rootDir +'/test/sample/ext/app/domain/Store.js",\r\n' +
                '"'+ rootDir +'/test/sample/ext/app/Controller.js",\r\n' +
                '"'+ rootDir +'/test/sample/extjs-app.js"\r\n' +
                '] }');
                done();
            });
        });

    });
});