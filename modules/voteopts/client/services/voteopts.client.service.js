// Voteopts service used to communicate Voteopts REST endpoints
(function () {
  'use strict';

  angular
    .module('voteopts')
    .factory('VoteoptsService', VoteoptsService);

  VoteoptsService.$inject = ['$resource'];

  function VoteoptsService($resource) {
    return $resource('api/voteopts/:voteoptId', {
      voteoptId: '@_id'
    }, {
      update: {
        method: 'PUT',
        ignoreLoadingBar: true
      }
    });
  }
}());
