'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
  // Init module configuration options
  var applicationModuleName = 'mean';
  var applicationModuleVendorDependencies = [
    'ngResource',
    'ngAnimate',
    'ngMessages',
    'ngSanitize',
    'ngTouch',
    'ui.router',
    'mgcrea.ngStrap',
    'ui.bootstrap',
    'ui.utils',
    'angularFileUpload',
    'ngTagsInput',
    'ngAria',
    'ngMaterial',
    'moment-picker',
    'infinite-scroll',
    'monospaced.elastic',
    'chart.js',
    'textAngular'
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
