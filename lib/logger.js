var fs = require('fs-extra');
var moment = require('moment');
var path = require('path');

function _require(module){
    delete require.cache[require.resolve(module)];
    return require(module);
}

function Logger(granularity, filepath, interval, winston_opts) {
    if (typeof granularity !== 'string') {
        throw new Error('Invalid granularity provided!');
    }

    this.granularity = granularity;

    switch (this.granularity) {
        case 'y':
            this.granularity = 'year';
            break;
        case 'M':
            this.granularity = 'month';
            break;
        case 'w':
            this.granularity = 'week';
            break;
        case 'd':
            this.granularity = 'day';
            break;
        case 'h':
            this.granularity = 'hour';
            break;
        case 'm':
            this.granularity = 'minute';
            break;
        case 's':
            this.granularity = 'second';
            break;
    }

    if (this.granularity.slice(-1) !== 's') {
        this.granularity += 's';
    }

    switch (this.granularity) {
        case 'years':
        case 'months':
        case 'weeks':
        case 'days':
        case 'hours':
        case 'minutes':
        case 'seconds':
            break;
        default:
            throw new Error('Invalid granularity provided!');
    }

    if (typeof filepath !== 'string') {
        throw new Error('Invalid path provided!');
    }

    this.filepath = filepath;
    this.interval = typeof interval !== 'number' ? 1 : interval;
    this.logger = _require('winston');
    this.winston_opts = typeof winston_opts === 'object' ? winston_opts : typeof interval === 'object' ? interval : {
        json: false,
        showLevel: false,
        timestamp: false
    };

    this.logger.loggers.get('default').on('error', function (err) { throw err; });
    this.logger.remove(this.logger.transports.Console);

    this.init(moment.utc());
}

Logger.prototype = {

    createWriteStreamForDate: function createWriteStreamForDate(d){
        var file = this.generateFilePath(d);

        return fs.createOutputStream(file.dir + '/' + file.base, { flags: 'a' });
    },

    generateFilePath: function generateFilePath(d){
        var p = this.filepath.replace(/{(.*?)}/g, function replacer(m1) {
            return d.format(m1).slice(1, -1);
        });
        return {
            base: path.basename(p),
            dir: path.dirname(p)
        };
    },

    init: function init(date){
        this.date = date;
        this.stream = this.createWriteStreamForDate(date);

        this.winston_opts.stream = this.stream;

        try {
            this.logger.add(this.logger.transports.File, this.winston_opts);
        } catch(err) {
            this.logger.remove(this.logger.transports.File);
            this.logger.add(this.logger.transports.File, this.winston_opts);
        }
    },

    isExpired: function isExpired(){
        return (~this.date.diff(Date.now(), this.granularity) + this.interval) > 0;
    },

    log: function log(){
        if (this.isExpired()) {
            this.init(moment.utc());
        }
        var args = ['info'];
        for(var i = 0, j = arguments.length; i < j; i++){
            args.push(arguments[i]);
        }
        this.logger.log.apply(this.logger, args);
    }

};

module.exports = Logger;