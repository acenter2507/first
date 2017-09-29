'use strict';

//TODO this should be Users service
angular.module('users.admin')
  .factory('AdminUserService', AdminUserService)
  .factory('AdminUserApi', AdminUserApi);

AdminUserService.$inject = ['$resource'];
function AdminUserService($resource) {
  return $resource('api/users/:aduserId', { aduserId: '@_id' }, {
    update: {
      method: 'PUT',
      ignoreLoadingBar: true
    },
  });
}
AdminUserApi.$inject = ['$http'];
function AdminUserApi($http) {
  this.getUsers = page => {
    return $http.get('/api/admins/users/' + page, {
      ignoreLoadingBar: true
    });
  };
  this.reset_pass = (userId, pass) => {
    return $http.post('/api/admins/users/' + userId + '/resetpass', { password: pass }, {
      ignoreLoadingBar: true
    });
  };
  this.get_polls_by_user = userId => {
    return $http.get('/api/admins/users/' + userId + '/polls', {
      ignoreLoadingBar: true
    });
  };
  this.get_cmts_by_user = userId => {
    return $http.get('/api/admins/users/' + userId + '/cmts', {
      ignoreLoadingBar: true
    });
  };
  this.get_votes_by_user = userId => {
    return $http.get('/api/admins/users/' + userId + '/votes', {
      ignoreLoadingBar: true
    });
  };
  this.get_reports_by_user = userId => {
    return $http.get('/api/admins/users/' + userId + '/reports', {
      ignoreLoadingBar: true
    });
  };
  this.get_bereports_by_user = userId => {
    return $http.get('/api/admins/users/' + userId + '/bereports', {
      ignoreLoadingBar: true
    });
  };
  this.get_suggests_by_user = userId => {
    return $http.get('/api/admins/users/' + userId + '/suggests', {
      ignoreLoadingBar: true
    });
  };
  this.get_logins_by_user = userId => {
    return $http.get('/api/admins/users/' + userId + '/logins', {
      ignoreLoadingBar: true
    });
  };
  return this;
}
