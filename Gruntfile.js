module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            all: {
                files: ['Gruntfile.js', 'src/**/*.js', 'tests/**/*.js'],
                tasks: ['test']
            },
        },

        jshint: {
            all: ['Gruntfile.js', 'src/**/*.js', 'tests/**/*.js'],
            options: {
                jshintrc: '.jshintrc',
            }
        },

        jasmine_nodejs: {
            all: {
                specs: ['tests/**'],
            },
        },

        browserify: {
            dist: {
                src: [
                    'src/**/*.js',
                ],
                dest: 'dist/immutabilis.js',
                options: {
                    browserifyOptions: {
                        debug: false,
                        standalone: 'immutabilis',
                    },
                }
            },
        },

        jasmine: {
            dist: {
                src: ['dist/immutabilis.js'],

                options: {
                    keepRunner: true,
                    specs: 'tests/**/*.js',
                },
            },

            coverage: {
                src: ['src/**/*.js'],

                options: {
                    keepRunner: true,
                    specs: 'tests/**/*.js',
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        template: require('grunt-template-jasmine-nml'),
                        templateOptions: {
                            pathmap: {
                                'src/': '.grunt/grunt-contrib-jasmine/src/',
                            }
                        },
                        coverage: 'reports/coverage/coverage.json',
                        report: [{
                            type: 'html',
                            options: {
                                dir: 'reports/coverage/html',
                            }
                        }, {
                            type: 'lcovonly',
                            options: {
                                dir: 'reports/coverage/lcov',
                            }
                        }],
                        thresholds: {
                            lines: 85,
                            statements: 85,
                            branches: 80,
                            functions: 90
                        },
                    }
                },
            },
        },

        clean: {
            dist: ['dist/*'],
        },

        coveralls: {
            travis: {
                src: 'reports/coverage/lcov/*.info',
                options: {
                    force: true,
                }
            }
        },

        uglify: {
            dist: {
                files: {
                    'dist/immutabilis.min.js': ['dist/immutabilis.js']
                }
            },
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jasmine-nodejs');
    grunt.loadNpmTasks('grunt-coveralls');

    grunt.registerTask('test', [
        'jshint',
        'jasmine_nodejs',
        'jasmine:coverage',
        'dist',
        'jasmine:dist',
    ]);

    grunt.registerTask('dist', [
        'clean',
        'browserify:dist',
        'uglify:dist'
    ]);
};
