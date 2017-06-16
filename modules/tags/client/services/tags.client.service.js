// Tags service used to communicate Tags REST endpoints
(function() {
  'use strict';

  angular
    .module('tags')
    .factory('TagsService', TagsService);

  TagsService.$inject = ['$resource'];

  function TagsService($resource) {
    return $resource('api/tags/:tagId', {
      tagId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }

  angular
    .module('tags')
    .factory('TagsApi', TagsApi);

  TagsApi.$inject = ['$http', '$q'];

  function TagsApi($http, $q) {
    this.loadTag = () => {

    };
  }
}());
