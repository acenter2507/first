// Categorys service used to communicate Categorys REST endpoints
(function () {
  'use strict';

  angular
    .module('categorys')
    .factory('CategorysService', CategorysService);

  CategorysService.$inject = ['$resource'];

  function CategorysService($resource) {
    return $resource('api/categorys/:categoryId', {
      categoryId: '@_id'
    }, {
      update: {
        method: 'PUT',
        ignoreLoadingBar: true
      }
    });
  }
}());
