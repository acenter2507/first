(function() {
  'use strict';
  angular.module('polls.admin')
    .factory('AdminPollsService', AdminPollsService);

  AdminPollsService.$inject = ['$http'];

  function AdminPollsService($http) {
    this.search = condition => {
      return $http.post('/api/polls/admin/search', { condition: condition }, {
        ignoreLoadingBar: true
      });
    };
    this.get_admin_poll_report = pollId => {
      return $http.post('/api/polls/admin/report', { pollId: pollId }, {
        ignoreLoadingBar: true
      });
    };
    return this;
  }
})();
