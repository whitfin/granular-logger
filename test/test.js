var async = require('async');
var fs = require('fs-extra');
var moment = require('moment');
var should = require('should');

const GranularLog = require('../');

const test_file = './tmp/test_file.txt';

describe('Granular Log', function(){

    require('it-each')({ testPerIteration: true });

    beforeEach('remove previous data', function(start){
        fs.remove('./tmp', function(){
            start();
        });
    });

    describe('constructor', function(){

        it('enforces a granularity as the first parameter', function(){
            try {
                new GranularLog();
                throw new Error('Should have failed!');
            } catch(e) {
                should(e.message).eql('Invalid granularity provided!');
            }
        });

        it('does not accept a non-string granularity', function(){
            try {
                new GranularLog({});
                throw new Error('Should have failed!');
            } catch(e) {
                should(e.message).eql('Invalid granularity provided!');
            }
        });

        it('rejects an invalid granularity', function(){
            try {
                new GranularLog('test');
                throw new Error('Should have failed!');
            } catch(e) {
                should(e.message).eql('Invalid granularity provided!');
            }
        });

        it('appends an \'s\' to a granularity when needed', function(){
            var logger1 = new GranularLog('day', test_file, 2);
            var logger2 = new GranularLog('days', test_file, 2);

            should(logger1.granularity).eql('days');
            should(logger2.granularity).eql('days');
        });

        it('enforces a file path as the second parameter', function(){
            try {
                new GranularLog('day');
                throw new Error('Should have failed!');
            } catch(e) {
                should(e.message).eql('Invalid path provided!');
            }
        });

        it('does not accept a non-string file path', function(){
            try {
                new GranularLog('day');
                throw new Error('Should have failed!');
            } catch(e) {
                should(e.message).eql('Invalid path provided!');
            }
        });

        it('sets a custom refresh interval', function(){
            should(new GranularLog('day', test_file, 2).interval).eql(2);
        });

        it('sets winston options correctly', function(){
            var opts = {
                test: true
            };

            should(new GranularLog('day', test_file, 2, opts).winston_opts).eql(opts);
        });

        it('configures winston without an interval', function(){
            var opts = {
                test: true
            };

            should(new GranularLog('day', test_file, opts).winston_opts).eql(opts);
        });

        it('correctly initializes a file stream', function(next){
            new GranularLog('day', test_file, 2);

            setTimeout(function(){
                should(fs.existsSync(test_file)).eql(true);
                next();
            }, 10);
        });

    });

    describe('normalization', function(){

        it.each([
            { short: 'y', long: 'years' },
            { short: 'M', long: 'months' },
            { short: 'w', long: 'weeks' },
            { short: 'd', long: 'days' },
            { short: 'h', long: 'hours' },
            { short: 'm', long: 'minutes' },
            { short: 's', long: 'seconds' }
        ], 'changes \'%s\' to \'%s\'', ['short','long'], function(element){
            var logger = new GranularLog(element.short, test_file);
            should(logger.granularity).eql(element.long);
        });

    });

    describe('parsing', function(){

        it('should be able to parse date file paths', function(next){
            new GranularLog('day', './tmp/{YYYY}/{MM}/{DD}.txt', 2);

            setTimeout(function(){
                should(fs.existsSync('./tmp/' + [
                    moment.utc().year(),
                    moment.utc().format('MM'),
                    moment.utc().date()
                ].join('/') + '.txt')).eql(true);
                next();
            }, 10);
        });

        it('maintains un-annotated paths', function(next){
            var log_file = './tmp/YYYY/MM/DD.txt';

            new GranularLog('day', log_file, 2);

            setTimeout(function(){
                should(fs.existsSync(log_file)).eql(true);
                next();
            }, 10);
        });

        it('can handle invalid names', function(next){
            new GranularLog('day', './tmp/{???}.txt', 1);

            setTimeout(function() {
                should(fs.existsSync('./tmp/???.txt')).eql(true);
                next();
            }, 10);
        });

    });

    describe('rotation', function(){

        it('appends text to a file stream', function(next){
            var logger = new GranularLog('day', test_file, 1);

            logger.log(this._runnable.title);

            setTimeout(function(){
                var contents = fs.readFileSync(test_file).toString();
                should(contents).eql(this._runnable.title + '\n');
                next();
            }.bind(this), 10);
        });

        it('rotates logs after an interval', function(next){
            this.slow(5000);

            var logger = new GranularLog('second', './tmp/test_{ss}.txt', 1);

            logger.log(this._runnable.title);

            async.series([
                function (cb){
                    setTimeout(cb, 2000);
                },
                function (cb){
                    logger.log(this._runnable.title);
                    cb();
                }.bind(this),
                function (cb){
                    setTimeout(cb, 10);
                },
                function (cb){
                    should(fs.readdirSync('./tmp/').length).eql(2);
                    cb();
                }
            ], next);
        });

        it('does not rotate logs before an interval', function(next){
            var logger = new GranularLog('second', test_file, 2);

            logger.log(this._runnable.title);

            async.series([
                function (cb){
                    setTimeout(cb, 10);
                },
                function (cb){
                    logger.log(this._runnable.title);
                    cb();
                }.bind(this),
                function (cb){
                    setTimeout(cb, 10);
                },
                function (cb){
                    should(fs.readdirSync('./tmp/').length).eql(1);
                    cb();
                }
            ], next);
        });

        it('passes arguments to winston', function(next){
            var logger = new GranularLog('day', test_file, 1);

            logger.log('%s', this._runnable.title);

            setTimeout(function(){
                var contents = fs.readFileSync(test_file).toString();
                should(contents).eql(this._runnable.title + '\n');
                next();
            }.bind(this), 10);
        });

    });

});