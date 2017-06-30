'use strict';

module.exports = {
  client: {
    lib: {
      css: [
        'public/lib/bootstrap/dist/css/bootstrap.css',
        'public/lib/bootstrap-additions/dist/bootstrap-additions.css',
        'public/lib/angular-material/angular-material.css',
        'public/lib/components-font-awesome/css/font-awesome.css',
        'public/lib/ng-tags-input/ng-tags-input.css',
        'public/lib/angular-moment-picker/dist/angular-moment-picker.css',
        'public/lib/textAngular/dist/textAngular.css'
      ],
      js: [
        'public/lib/angular/angular.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-animate/angular-animate.js',
        'public/lib/angular-messages/angular-messages.js',
        'public/lib/angular-sanitize/angular-sanitize.js',
        'public/lib/angular-socket-io/socket.js',
        'public/lib/angular-touch/angular-touch.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
        'public/lib/angular-ui-utils/ui-utils.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/angular-bootstrap/ui.bootstrap.materialPicker.js',
        'public/lib/angular-strap/dist/angular-strap.js',
        'public/lib/angular-strap/dist/angular-strap.tpl.js',
        'public/lib/angular-strap/dist/angular-strap.compat.js',
        'public/lib/angular-file-upload/angular-file-upload.js',
        'public/lib/angular-aria/angular-aria.js',
        'public/lib/angular-material/angular-material.js',
        'public/lib/angular-ui-switch/angular-ui-switch.js',
        'public/lib/angular-elastic/elastic.js',
        'public/lib/chart.js/dist/Chart.js',
        'public/lib/angular-chart.js/dist/angular-chart.js',
        'public/lib/ng-tags-input/ng-tags-input.js',
        'public/lib/underscore/underscore.js',
        'public/lib/moment/moment.js',
        'public/lib/angular-moment/angular-moment.js',
        'public/lib/angular-timer/angular-timer.js',
        'public/lib/angular-moment-picker/dist/angular-moment-picker.js',
        'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
        'public/lib/ngInfiniteScroll/build/ng-infinite-scroll.js',
        'public/lib/textAngular/dist/textAngular-rangy.min.js',
        'public/lib/textAngular/dist/textAngular-sanitize.min.js',
        'public/lib/textAngular/dist/textAngular.js',
        'public/lib/textAngular/dist/textAngularSetup.js'
      ],
      tests: ['public/lib/angular-mocks/angular-mocks.js']
    },
    css: [
      'modules/*/client/css/*.css'
    ],
    less: [
      'modules/*/client/less/*.less'
    ],
    sass: [
      'modules/*/client/scss/*.scss'
    ],
    js: [
      'modules/core/client/app/config.js',
      'modules/core/client/app/init.js',
      'modules/*/client/*.js',
      'modules/*/client/**/*.js',
      'modules/*/client/**/**/*.js',
    ],
    views: ['modules/*/client/views/**/*.html'],
    templates: ['build/templates.js']
  },
  server: {
    gruntConfig: 'gruntfile.js',
    gulpConfig: 'gulpfile.js',
    allJS: ['server.js', 'config/**/*.js', 'modules/*/server/**/*.js'],
    models: 'modules/*/server/models/**/*.js',
    routes: ['modules/!(core)/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
    sockets: 'modules/*/server/sockets/**/*.js',
    config: 'modules/*/server/config/*.js',
    policies: 'modules/*/server/policies/*.js',
    views: 'modules/*/server/views/*.html'
  }
};
