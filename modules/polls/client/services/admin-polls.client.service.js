(function() {
  'use strict';
  angular.module('polls.admin')
    .factory('AdminPollsService', AdminPollsService);

  AdminPollsService.$inject = ['$http'];

  function AdminPollsService($http) {
    this.search = condition => {
      return $http.post('/api/polls/admin/search', { condition: condition });
    };
    this.get_admin_poll_report = pollId => {
      return $http.get('/api/polls/admin/report', { params: { pollId: pollId } });
    };
    return this;
  }
})();
