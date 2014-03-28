module.exports = function(grunt) {

  // helper function to put the theme path in front of every filename in the array
  appendRelativePathToScripts = function(scriptsArray) {
    for (var i = 0; i < scriptsArray.length; i++) {
      scriptsArray[i] = grunt.config.process("<%= paths.theme %>/js/dev/") + scriptsArray[i];
    }
    return scriptsArray;
  }

  // set these two configs BEFORE initConfig so that grunt.config.process function can find the "paths.theme" variable
  grunt.initConfig({
    paths: {
      theme: '/ebs1/www/wp-content/themes/hootsuite'
    },
  });

  /*
    This will look for a config.json file in a JS folder 
    config.json will determine the order JS is uglified in

    JSON Format should be: 
    {"files":["file1.js", "file2.js"]}
  */
  grunt.config("config", grunt.file.readJSON(grunt.config.process("<%= paths.theme %>") + "/js/dev/config.json"));

  // project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    paths: { 
      // need to set this again here or else templating won't work for some reason...
      theme: grunt.config.process("<%= paths.theme %>")
    },
    less:{
      development: {
        files: {
          "<%= paths.theme %>/css/styles.css": "<%= paths.theme %>/css/less/styles.less"
        }
      },
      production: {
        options: {
          yuicompress: true
        },
        files: {
          "<%= paths.theme %>/css/styles.css": "<%= paths.theme %>/css/less/styles.less"
        }
      }
    },
    jshint: {
      beforeconcat: ['<%= paths.theme %>/js/dev/scripts.js']
    },
    uglify: {
      my_target: {
        files: {
          '<%= paths.theme %>/js/scripts.min.js':appendRelativePathToScripts(grunt.config.process("<%= config.files %>")),
        }
      }
    },
    watch: {
      less: {
        files: ['<%= paths.theme %>/css/less/*.less'],
        tasks: ['less:development']
      },
      js: {
        files: ['<%= paths.theme %>/js/dev/scripts.js'],
        tasks: ['uglify', 'jshint']
      }
    }
  });

  // load the plugin
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-sass');

  // load tasks
  grunt.registerTask('default', ['watch']);
}