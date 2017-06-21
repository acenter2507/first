// Cmts service used to communicate Cmts REST endpoints
(function () {
  'use strict';

  angular
    .module('cmts')
    .factory('CmtsService', CmtsService);

  CmtsService.$inject = ['$resource'];

  function CmtsService($resource) {
    return $resource('api/cmts/:cmtId', {
      cmtId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }

  angular
    .module('cmts')
    .factory('CmtsApi', CmtsApi);

  CmtsApi.$inject = ['$http'];

  function CmtsApi($http) {
    return {
      findLike: (id) => {
        return $http.get('/api/findLike/' + id);
      }
    };
  }
}());
