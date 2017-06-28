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
    'ui.router',
    'ui.bootstrap',
    'ui.utils',
    'angularFileUpload',
    'uiSwitch',
    'ngTagsInput',
    'ngAria',
    'ngMaterial',
    'moment-picker',
    'mgcrea.ngStrap',
    'infinite-scroll',
    'monospaced.elastic',
    'chart.js'
  ];

  // Add a new vertical module
  var registerModule = function(moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
    angular.module(applicationModuleName).requires.push('simditor');
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();
