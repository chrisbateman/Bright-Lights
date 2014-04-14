module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner: '/**\n' +
                    //' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                    ' * <%= pkg.name %> - v<%= pkg.version %>\n' +
                    ' * <%= pkg.homepage %>\n' +
                    ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
                    ' * Licensed <%= pkg.licenses.type %> <<%= pkg.licenses.url %>>\n' +
                    ' */\n'
        },
        concat: {
            js: {
                src: ['src/hand.js', 'src/external.js', 'src/main.js'],
                dest: 'build/app.js',
            },
        },
        uglify: {
            build: {
                src: 'build/app.js',
                dest: 'build/app.min.js'
            },
            options: {
                banner: '<%= meta.banner %>'
            }
        },
        cssmin: {
            add_banner: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                files: {
                    'build/styles.min.css': ['src/*.css']
                }
            }
        },
        copy: {
            folders: {
                cwd: 'src',
                src: ['fonts/**'],
                dest: 'build',
                expand: true
            },
        },
        clean: {
            js: {
                src: ['build/app.js']
            }
        },
        processhtml: {
            build: {
                files: {
                    'build/index.htm': ['src/index.htm']
                }
            }
        },
        manifest: {
            build: {
                options: {
                    basePath: 'build/',
                    verbose: false
                },
                src: [
                    '*.js',
                    '*.css',
                    'img/*',
                    'fonts/*'
                ],
                dest: 'build/manifest.appcache'
            }
        },
        imagemin: {
            build: {
                options: {
                    pngquant: true
                },
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['img/*.{png,jpg,gif}'],
                    dest: 'build/'
                }]
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-manifest');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    
    
    grunt.registerTask('default', ['copy', 'concat', 'uglify', 'cssmin', 'clean', 'processhtml', 'manifest']);
    
};