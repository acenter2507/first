// Votes service used to communicate Votes REST endpoints
(function() {
  'use strict';

  angular
    .module('votes')
    .factory('VotesService', VotesService);

  VotesService.$inject = ['$resource'];

  function VotesService($resource) {
    return $resource('api/votes/:voteId', {
      voteId: '@_id'
    }, {
      update: {
        method: 'PUT',
        ignoreLoadingBar: true
      }
    });
  }
}());
