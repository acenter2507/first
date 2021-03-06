'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
  // Init module configuration options
  var applicationModuleName = 'blablaer';
  var applicationModuleVendorDependencies = [
    'ngAnimate',
    'ngResource',
    'ngMessages',
    'ngSanitize',
    'pascalprecht.translate',
    'ngCookies',
    'ngDialog',
    'ui.router',
    'ui.bootstrap',
    'ui.utils',
    'btford.socket-io',
    'angularFileUpload',
    'ngTagsInput',
    'ngAria',
    'ngMaterial',
    'angularMoment',
    'moment-picker',
    'infinite-scroll',
    'monospaced.elastic',
    'chart.js',
    'textAngular',
    'ui.bootstrap.materialPicker',
    'toastr',
    'webStorageModule',
    'angucomplete-alt',
    'angular-loading-bar',
    '720kb.socialshare',
    'vcRecaptcha',
    'ngImgCrop',
    'duScroll'
  ];

  // Add a new vertical module
  var registerModule = function(moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  var requireModule = function(moduleName) {
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule,
    requireModule: requireModule
  };
})();
