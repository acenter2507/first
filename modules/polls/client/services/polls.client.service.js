// Polls service used to communicate Polls REST endpoints
(function () {
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

  angular
    .module('polls')
    .factory('PollsApi', PollsApi);

  PollsApi.$inject = ['$http'];

  function PollsApi($http) {
    return {
      findOpts: id => {
        return $http.get('/api/findOpts/' + id);
      },
      findCmts: id => {
        return $http.get('/api/findCmts/' + id);
      },
      findTags: id => {
        return $http.get('/api/findTags/' + id);
      },
      findVotes: id => {
        return $http.get('/api/findVotes/' + id);
      },
      findOwnerVote: id => {
        return $http.get('/api/findOwnerVote/' + id);
      },
      findVoteopts: id => {
        return $http.get('/api/findVoteopts/' + id);
      },
      findPollLike: id => {
        return $http.get('/api/findPollLike/' + id);
      },
      findPolluser: id => {
        return $http.get('/api/findPolluser/' + id);
      }
    };
  }
}());
