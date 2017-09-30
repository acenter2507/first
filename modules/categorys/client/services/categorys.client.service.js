// Categorys service used to communicate Categorys REST endpoints
(function () {
  'use strict';

  angular
    .module('categorys')
    .factory('CategorysService', CategorysService)
    .factory('CategorysApi', CategorysApi);

  CategorysService.$inject = ['$resource'];

  function CategorysService($resource) {
    return $resource('api/categorys/:categoryId', { categoryId: '@_id' }, {
      update: {
        method: 'PUT',
        ignoreLoadingBar: true
      }
    });
  }

  CategorysApi.$inject = ['$http'];
  function CategorysApi($http) {
    /**
     * Lấy list poll thuộc category
     */
    this.loadPollByCategoryId = (categoryId, page, language, sort) => {
      return $http.get('/api/categorys/' + categoryId + '/polls/' + page + '/' + language + '/' + sort, {
        ignoreLoadingBar: true
      });
    };
    return this;
  }
}());
