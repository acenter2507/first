'use strict';

module.exports = {
  client: {
    lib: {
      css: [
        'public/lib/bootstrap/dist/css/bootstrap.css',
        'public/lib/angular-material/angular-material.css',
        'public/lib/components-font-awesome/css/font-awesome.css',
        'public/lib/ng-tags-input/ng-tags-input.css',
        'public/lib/angular-moment-picker/dist/angular-moment-picker.css',
        'public/lib/textAngular/dist/textAngular.css',
        'public/lib/angular-toastr/dist/angular-toastr.css',
        'public/lib/ng-dialog/css/ngDialog.min.css',
        'public/lib/ng-dialog/css/ngDialog-theme-default.min.css',
        'public/lib/angucomplete-alt/angucomplete-alt.css',
        'public/lib/simple-line-icons/css/simple-line-icons.css',
        'public/lib/angular-loading-bar/build/loading-bar.css'
      ],
      js: [
        'public/lib/jquery/dist/jquery.min.js',
        'public/lib/angular/angular.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-animate/angular-animate.js',
        'public/lib/angular-messages/angular-messages.js',
        'public/lib/angular-sanitize/angular-sanitize.js',
        'public/lib/angular-cookies/angular-cookies.js',
        'public/lib/angular-socket-io/socket.js',
        'public/lib/angular-touch/angular-touch.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
        'public/lib/angular-ui-utils/ui-utils.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/angular-bootstrap/ui.bootstrap.materialPicker.js',
        'public/lib/angular-file-upload/angular-file-upload.js',
        'public/lib/angular-aria/angular-aria.js',
        'public/lib/angular-material/angular-material.js',
        'public/lib/angular-ui-switch/angular-ui-switch.js',
        'public/lib/angular-elastic/elastic.js',
        'public/lib/angular-webstorage/angular-webstorage.js',
        'public/lib/chart.js/dist/Chart.js',
        'public/lib/angular-chart.js/dist/angular-chart.js',
        'public/lib/ng-tags-input/ng-tags-input.js',
        'public/lib/underscore/underscore.js',
        'public/lib/moment/moment.js',
        'public/lib/moment-timezone/moment-timezone.js',
        'public/lib/angular-moment/angular-moment.js',
        'public/lib/angular-moment-picker/dist/angular-moment-picker.js',
        'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
        'public/lib/ngInfiniteScroll/build/ng-infinite-scroll.js',
        'public/lib/textAngular/dist/textAngular-rangy.min.js',
        'public/lib/textAngular/dist/textAngular-sanitize.min.js',
        'public/lib/textAngular/dist/textAngular.js',
        'public/lib/textAngular/dist/textAngularSetup.js',
        'public/lib/angular-toastr/dist/angular-toastr.tpls.js',
        'public/lib/ng-dialog/js/ngDialog.min.js',
        'public/lib/angucomplete-alt/angucomplete-alt.js',
        'public/lib/angular-loading-bar/build/loading-bar.js',
        'public/lib/angular-breadcrumb/dist/angular-breadcrumb.min.js',
        'public/lib/angular-socialshare/dist/angular-socialshare.js',
        'public/lib/angular-translate/angular-translate.js',
        'public/lib/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
        // 'public/lib/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
        'public/lib/angular-translate-storage-local/angular-translate-storage-local.js'
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
