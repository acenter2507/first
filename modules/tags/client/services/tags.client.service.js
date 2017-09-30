// Tags service used to communicate Tags REST endpoints
(function () {
  'use strict';

  angular
    .module('tags')
    .factory('TagsService', TagsService)
    .factory('TagsApi', TagsApi);

  TagsService.$inject = ['$resource'];

  function TagsService($resource) {
    return $resource('api/tags/:tagId', { tagId: '@_id' }, {
      update: {
        method: 'PUT',
        ignoreLoadingBar: true
      }
    });
  }

  TagsApi.$inject = ['$http'];

  function TagsApi($http) {
    /**
     * Lấy danh sách tags phổ biến
     */
    this.loadPopularTags = () => {
      return $http.get('/api/tags/popular', {
        ignoreLoadingBar: true
      });
    };
    /**
     * Lấy list poll thuộc tag
     */
    this.getPollsByTagId = (tagId, page, language, sort) => {
      return $http.get('/api/tags/' + tagId + '/polls/' + page + '/' + language + '/' + sort, {
        ignoreLoadingBar: true
      });
    };
    return this;
  }
}());
