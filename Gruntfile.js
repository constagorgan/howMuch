/*global module, require */
module.exports = function (grunt) {
    "use strict";
    
    var config = {
        dist: "dist"
    };
    
    grunt.loadNpmTasks("grunt-wiredep");
    grunt.loadNpmTasks("grunt-bower-requirejs");
    grunt.loadNpmTasks("grunt-contrib-compass");
    grunt.loadNpmTasks("grunt-contrib-imagemin");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-requirejs");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-regex-replace");
    grunt.loadNpmTasks("grunt-usemin");
    grunt.loadNpmTasks("grunt-contrib-compress");
    
    grunt.initConfig({
        config: config,
        pkg: grunt.file.readJSON("package.json"),
        wiredep: {
            target: {
                src: [
                    "index.html"
                ]
            }
        },
        bower: {
            target: {
                rjsConfig: "js/main.js",
                options: {
                    transitive: true,
                    exclude: [
                        "require",
                        "requirejs"
                    ]
                }
            }
        },
        compass: {
            dev: {
                options: {
                    sassDir: 'scss',
                    cssDir: 'css',
                    watch: true
                }
            },
            dist: {
                options: {
                    sassDir: 'scss',
                    cssDir: 'css',
                    environment: "production"
                }
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: "Content/img",
                    src: "**/*.{gif,jpeg,jpg,png}",
                    dest: "<%= config.dist %>/build/Content/img"
                }]
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        ".tmp",
                        "<%= config.dist %>/*",
                        "!<%= config.dist %>/build/.git",
                        "css/style.css"
                    ]
                }]
            }
        },
        requirejs: {
            compile: {
                options: {
                    mainConfigFile: "js/main.js",
                    name: "main",
                    out: "<%= config.dist %>/build/js/eventsnitch.js",
                    preserveLicenseComments: false,
                    include: ["../bower_components/requirejs/require.js"]
                }
            }
        },
        useminPrepare: {
            options: {
                dest: "<%= config.dist %>/build"
            },
            html: "index.html"
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    dest: "<%= config.dist %>/build",
                    src: [
                        "index.html",
                        "favicon.ico",
                        "css/style.css",
                        "templates/{,*/}*.html",
                        "Content/fonts/*.otf",
                        "Content/fonts/*.ttf"
                    ]
                }, {
                    expand: true,
                    cwd: 'bower_components/components-font-awesome/fonts',
                    dest: '<%= config.dist %>/build/fonts',
                    src: [
                      "*"
                    ]
                }, {
                    expand: true,
                    cwd: 'bower_components/bootstrap/fonts',
                    dest: '<%= config.dist %>/build/fonts',
                    src: [
                      "*"
                    ]
                }]
            }
        },
        "regex-replace": {
            dist: {
                src: ["<%= config.dist %>/build/index.html"],
                actions: [{
                    name: "requirejs-onefile",
                    search: "<script data-main=\".*\" src=\"bower_components/requirejs/require.js\"></script>",
                    replace: "<script src=\"js/eventsnitch.js\"></script>",
                    flags: "g"
                }]
            }, 
            distTwo: {
                src: ["<%= config.dist %>/build/js/eventsnitch.js"],
                actions: [{
                    name: "requirejs-onefile",
                    search: "\\(../Content/img",
                    replace: "\\(Content/img",
                    flags: "g"
                }]
            }
        },
        usemin: {
            options: {
                assetsDirs: [
                    "<%= config.dist %>/build",
                    "<%= config.dist %>/build/Content/img",
                    "<%= config.dist %>/build/css"
                ]
            },
            html: ["<%= config.dist %>/build/{,*/}*.html"],
            css: ["<%= config.dist %>/build/css/{,*/}*.css"]
        },
        compress: {
            dist: {
                options: {
                    archive: "<%= config.dist %>/eventsnitch-<%= pkg.version %>.tar.gz"
                },
                expand: true,
                dot: true,
                cwd: "<%= config.dist %>/build",
                src: ["**/*"]
            }
        }
    });

    grunt.registerTask("build", [
        "clean:dist",
        "wiredep",
        "compass:dist",
        "imagemin",
        "requirejs",
        "useminPrepare",
        "concat",
        "cssmin",
        "copy:dist",
        "regex-replace",
        "usemin",
        "compress"
    ]);
};
