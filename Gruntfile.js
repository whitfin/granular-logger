module.exports = function(grunt) {

    // Project configuration
    grunt.initConfig({
        clean: {
            coverage: ['coverage'],
            test: ['tmp']
        },
        mochacov: {
            html: {
                options: {
                    slow: 1250,
                    timeout: 3000,
                    reporter: 'html-cov',
                    output: 'coverage/index.html',
                    instrument: true
                },
                src: ['test/**/*.js']
            },
            lcov: {
                options: {
                    slow: 1250,
                    timeout: 3000,
                    reporter: 'mocha-lcov-reporter',
                    output: 'coverage/report.lcov',
                    instrument: true
                },
                src: ['test/**/*.js']
            }
        },
        mochaTest: {
            options: {
                slow: 1250,
                timeout: 3000,
                reporter: 'spec',
                ignoreLeaks: false
            },
            src: ['test/**/*.js']
        },
        jshint: {
            options: {
                jshintrc: true
            },
            src: ['*.js','lib/**/*.js','test/**/*.js']
        }
    });

    // Load grunt plugins for modules
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mocha-cov');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Register tasks
    grunt.registerTask('coverage', ['clean:coverage','mochacov','clean:test']);
    grunt.registerTask('default', ['clean:test','jshint','mochaTest','clean:test']);
    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('test', ['clean:test','mochaTest','clean:test']);

};