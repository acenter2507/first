'use strict';

angular.module('core').config(['$dropdownProvider',
  function($dropdownProvider) {
    angular.extend($dropdownProvider.defaults, {
      animation: 'am-fade',
      placement: 'auto'
    });
  }
]);
