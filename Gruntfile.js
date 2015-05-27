module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    var bowerPath = 'bower_components/',
      appDir = 'app',
      srcDir = 'src',
      srcPaths = {
          app: {
              less: srcDir + '/app/less/',
              js: srcDir + '/app/js/'
          }
      },
    buildPaths = {
        app: {
            css: appDir + '/css/',
            js: appDir + '/js/',
            fonts: appDir + '/fonts/'
        }
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        /**
         * [bower_concat description]
         * @type {Object}
         */
        bower_concat: {
            app: {
                dest: buildPaths.app.js + 'deps.js',
                cssDest: buildPaths.app.css + 'deps.css',
                dependencies: {
                    "angular": "jquery"
                },
                exclude: [
                    'font-awesome', // Loading via CDN
                    'flex.less',
                    // So we can customize bootstrap in a upgrade-friendly manner and also,
                    // we're not using bootstrap's js
                    'bootstrap',
                    // Some packages use 'angularjs' name as dependency. We already have it as 'angular'.
                    'angularjs'
                ]
            }
        },
        /**
         * [copy description]
         * @type {Object}
         */
        copy: {
            deps: {
                files: [
                    {
                        expand: true,
                        cwd: bowerPath + 'bootstrap/dist/fonts/',
                        src: '*',
                        dest: buildPaths.app.fonts,
                        timestamp: true,
                        mode: 0644
                    }
                ]
            }
        },
        /**
         * [uglify description]
         * @type {Object}
         */
        uglify: {
            deps: {
                files: [
                    {
                        src: '<%= bower_concat.app.dest %>',
                        dest: buildPaths.app.js + 'deps.min.js'
                    }
                ],
                options: {
                    mangle: true,
                    compress: true,
                    sourceMap: true
                }
            },
            app: {
                src: '<%= concat.app.dest %>',
                dest: buildPaths.app.js + 'app.min.js',
                options: {
                    mangle: true,
                    compress: true,
                    sourceMap: true
                }
            }
        },
        /**
         * [cssmin description]
         * @type {Object}
         */
        cssmin: {
            deps: {
                files: [
                    {
                        expand: true,
                        src: ['<%= bower_concat.app.cssDest %>'],
                        dest: '.',
                        ext: '.min.css'
                    }
                ]
            }
        },
        /**
         * [less description]
         * @type {Object}
         */
        less: {
            app: {
                src: srcPaths.app.less + 'main.less',
                dest: buildPaths.app.css + 'app.min.css',
                options: {
                    paths: [
                        srcPaths.app.less + 'twbs',
                        srcPaths.app.less + 'components'],
                    compress: true,
                    sourceMap: true,
                    sourceMapFilename: '<%= less.app.dest %>.map',
                    sourceMapURL: 'app.min.css.map',
                    sourceMapRootpath: '../../'
                }
            }
        },
        /**
         * [concat description]
         * @type {Object}
         */
        concat: {
            app: {
                src: srcPaths.app.js + '**/*.js',
                dest: buildPaths.app.js + 'app.js'
            }
        },
        /**
         * [ngAnnotate description]
         * @type {Object}
         */
        ngAnnotate: {
            app: {
                src: '<%= concat.app.dest %>',
                dest: '<%= concat.app.dest %>'
            }
        },
        /**
         * [clean description]
         * @type {Object}
         */
        clean: {
            deps: [
                buildPaths.app.css + 'deps.*', buildPaths.app.js + 'deps.*', buildPaths.app.fonts
            ],
            app: [
                buildPaths.app.css + 'app.*', buildPaths.app.js + 'app.*'
            ]
        },
        /**
         * [concurrent description]
         * @type {Object}
         */
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            build: {
                tasks: ['build-app']
            },
            app: {
                tasks: ['build-css', 'build-js']
            }
        },
        /**
         * [watch description]
         * @type {Object}
         */
        watch: {
            options: {
                reload: true
            },
            bower: {
                files: ['bower.json'],
                tasks: ['build-deps']
            },
            less: {
                files: [srcPaths.app.less + '**/*.less'],
                tasks: ['build-css']
            },
            js: {
                files: [srcPaths.app.js + '**/*.js'],
                tasks: ['build-js']
            }
        }
    });

    /**
     * Tasks
     */

    // Build All The Things!
    grunt.registerTask('default', ['build-deps', 'concurrent:build']);

    // Builds dependencies of app and admin
    grunt.registerTask('build-deps', ['clean:deps', 'bower_concat', 'uglify:deps', 'cssmin:deps', 'copy:deps']);

    // Build app stuff
    grunt.registerTask('build-app', ['clean:app', 'concurrent:app']);
    grunt.registerTask('build-css', ['less:app']);
    grunt.registerTask('build-js', ['concat:app', 'ngAnnotate:app', 'uglify:app']);

}