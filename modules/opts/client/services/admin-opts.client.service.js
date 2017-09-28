(function () {
  'use strict';
  angular.module('opts.admin')
    .factory('AdminOptsService', AdminOptsService);

  AdminOptsService.$inject = ['$http'];

  function AdminOptsService($http) {
    return this;
  }
})();
