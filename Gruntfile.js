module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        "jshintrc":true
      },
      all: [
        'src/*.js'
      ],
    },
    uglify: {
      options: {
        stripBanner: true,
        banner: [
          '/*!',
          ' <%= pkg.name %>.js v<%= pkg.version %> | <%= pkg.homepage %> (<%= grunt.template.today("yyyy-mm-dd") %>)',
          ' Copyright (c) <%= pkg.author %>',
          '*/\n'
        ].join('\n'),
      },
      build: {
        src: 'src/jquery.kanTreegrid.js',
        dest: 'build/jquery.kanTreegrid.min.js'
      }
    },



  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jshint', 'uglify']);
}
