(function() {
  'use strict';
  angular.module('polls.admin')
    .factory('AdminPollsService', AdminPollsService);

  AdminPollsService.$inject = ['$http'];

  function AdminPollsService($http) {
    this.search = condition => {
      return $http.post('/api/polls/admin/search', { condition: condition });
    };
    return this;
  }
})();
