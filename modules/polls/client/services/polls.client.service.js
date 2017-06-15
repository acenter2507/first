// Polls service used to communicate Polls REST endpoints
(function() {
  'use strict';

  angular
    .module('polls')
    .factory('PollsService', PollsService);

  PollsService.$inject = ['$resource'];

  function PollsService($resource) {
    return $resource('api/polls/:pollId', {
      pollId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }

  // Polls api
  angular
    .module('polls')
    .factory('PollsApi', PollsApi);

  PollsService.$inject = ['$http'];

  function PollsApi($http) {
    return {
      opts: (id) => {
        return $http.get('/api/polls/:pollId/opts', {pollId: id});
      }
    };
  }
}());
