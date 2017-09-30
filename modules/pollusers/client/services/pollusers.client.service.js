// Follows service used to communicate Follows REST endpoints
(function () {
  'use strict';

  angular
    .module('follows')
    .factory('FollowsService', FollowsService);

  FollowsService.$inject = ['$resource'];

  function FollowsService($resource) {
    return $resource('api/follows/:followId', { followId: '@_id' }, {
      update: {
        method: 'PUT',
        ignoreLoadingBar: true
      }
    });
  }
}());
