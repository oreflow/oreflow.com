module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),


        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'temp/app.full.js',
                dest: 'temp/app.min.js'
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['app/app.js', '<%= ngtemplates.oreflow.dest %>', 'app/**/*.js'],
                dest: 'temp/app.full.js'
            }
        },
        ngtemplates:  {
            oreflow:        {
                src:      'app/**/*.html',
                dest:     'temp/template.js'
            }
        },
        copy: {
            main: {
                files: [
                    // includes files within path
                    {flatten: true, src: ['temp/app.min.js'], dest: 'dist/app.min.js', filter: 'isFile'},

                    // includes files within path and its sub-directories
                    {expand: true, src: ['Libs/**'], dest: 'dist/'},

                    {expand: true, src: ['app/**/*.html'], dest: 'dist/'},
                    {expand: true, src: ['models/**/*.obj'], dest: 'dist/'},
                    {expand: true, src: ['models/**/*.mtl'], dest: 'dist/'},
                    {expand: true, src: ['paths/**/*.obj'], dest: 'dist/'}


                ]
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-dom-munger');
    grunt.loadNpmTasks('grunt-angular-templates');

    // Default task(s).
    grunt.registerTask('default', ['uglify']);
    grunt.registerTask('build', ['ngtemplates:oreflow', 'concat', 'uglify', 'copy:main']);

};