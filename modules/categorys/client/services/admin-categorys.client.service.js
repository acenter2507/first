// Categorys service used to communicate Categorys REST endpoints
(function () {
  'use strict';

  angular
    .module('categorys.admin')
    .factory('AdminCategorysService', AdminCategorysService);

  AdminCategorysService.$inject = ['$http'];

  function AdminCategorysService($http) {
    return this;
  }
}());
