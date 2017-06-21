// Likes service used to communicate Likes REST endpoints
(function () {
  'use strict';

  angular
    .module('likes')
    .factory('LikesService', LikesService);

  LikesService.$inject = ['$resource'];

  function LikesService($resource) {
    return $resource('api/likes/:likeId', {
      likeId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
