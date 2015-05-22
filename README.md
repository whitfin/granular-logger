Granular Logger [![Build Status](https://travis-ci.org/iwhitfield/granular-logger.svg?branch=master)](https://travis-ci.org/iwhitfield/granular-logger) [![Code Climate](https://codeclimate.com/github/iwhitfield/granular-logger/badges/gpa.svg)](https://codeclimate.com/github/iwhitfield/granular-logger) [![Test Coverage](https://codeclimate.com/github/iwhitfield/granular-logger/badges/coverage.svg)](https://codeclimate.com/github/iwhitfield/granular-logger)
====

This module is a very simple wrapper around [winston](https://github.com/winstonjs/winston) in order to provide extra flexibility when using time-based log-rotation.

### Compatibility ###

This module is built on each commit with TravisCI on Node 0.10.x and 0.12.x. In addition, the latest version of `io.js` on Travis is also used, although compability here is a lower priority. Build results are sent over to [Code Climate](https://codeclimate.com/github/iwhitfield/granular-logger) for analysis.

Be aware that this module has had limited testing outside of use in small projects, and as such caution is advised. The module version is currently below v1.0.0, so the API may change at any time, *although I do not anticipate doing so*.

### Setup ###

`granular-logger` is available on [npm](https://www.npmjs.com/package/granular-logger), so simply install it.

```
$ npm install granular-logger
```

### Creation ###

In advance of using this module, you should probably become familiar with both [moment](http://momentjs.com) and [winston](https://github.com/winstonjs/winston).

It's extremely easy to create an instance of a logger, using the constructor defined below. Following is a quick overview of the arguments:

```javascript
new Log(granularity, filepath[, interval][, winston_opts]);
```

**granularity**

The time based granularity to log against, for example `day`. This can be any granularity recognised by `moment` except `ms` (it makes no sense to log based on ms), and is a required argument. You can use long or short forms, e.g. `year` or `y`.

**filepath**

This parameter is the path to the file the logs should output to. This path can contain date strings to be formatted by `moment` using a `{}` syntax. Below is an example. This is the main use case behind this module, as it isn't possible to define date-based paths with winston.

```javascript
var Logger = require('granular-logger');

var logger = new Logger('day', '/tmp/logs/app/{YYYY}/{MM}/{DD}/app.log');

console.log(logger.filepath); // becomes /tmp/logs/app/2015/05/21/app.log
```

**interval**

In case you wish to rotate on some other interval than `1 <granular>`, this parameter allows you to define the interval before rotation. E.g. `granularity: day` and `interval: 7` would mean a weekly rotation. This parameter is optional, and defaults to `1`.

**winston_opts**

This final parameter is simply passed straight through to the winston instance, in case you wish to customise your logging further. If no options are specified, a default will be used which simply logs any provided String straight to a file appended with `\n`.

### Writing ###

Calling `write` will write to the log. The arguments taken match those used by winston as defined [here](https://github.com/winstonjs/winston#string-interpolation). Please note that the first value of `info` should not be added; it is inserted automatically. 

```
var Logger = require('granular-logger');

var logger = new Logger('day', '/tmp/logs/app/{YYYY}/{MM}/{DD}/app.log');

logger.write('test_string_%d', 1); // test_string_1
```

### Tests

Tests are controlled by Grunt, so ensure you have the CLI installed. 

```bash
$ npm test
# or
$ grunt test
```

You can also generate coverage reports in HTML and lcov formats using:

```bash
$ grunt coverage
```

### Issues

If you find any issues inside this module, feel free to open an issue [here](https://github.com/iwhitfield/granular-logger/issues "Granular Logger Issues").