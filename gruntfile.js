'use strict';

module.exports = function(grunt) {

  grunt.initConfig({

    watch: {
      options: {
          livereload: true
      },
      reload: {
        files : ['*']
      },
      js: {
          files: ['js/*', 'js/*.js'],
          tasks: ['uglify'],
          options: {
              spawn: false
          }
      }
    },
    uglify: {
      compile: {
        files: {
        'js/main.min.js': ['js/main.js']
        }
      }
    },

    });

    // Load tasks from NPM
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-notify');

    // Default task.
    // grunt.registerTask('default', ['sass', 'cssmin', 'imagemin']);

};

