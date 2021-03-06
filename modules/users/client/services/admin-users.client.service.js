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
  this.loadAdminUsers = (page, condition) => {
    return $http.post('/api/admins/users/search', { condition: condition, page: page }, { ignoreLoadingBar: true });
  };
  this.generateUsers = (number, pass) => {
    return $http.get('/api/admins/users/generate/' + number + '/' + pass, { ignoreLoadingBar: true });
  };
  this.resetUserPassword = (userId, pass) => {
    return $http.post('/api/admins/users/' + userId + '/resetpass', { password: pass }, {
      ignoreLoadingBar: true
    });
  };
  this.loadAdminUserLogins = (userId, page, condition) => {
    return $http.post('/api/admins/users/' + userId + '/logins', { condition: condition, page: page }, { ignoreLoadingBar: true });
  };
  this.loadAdminUserPolls = (userId, page, condition) => {
    return $http.post('/api/admins/users/' + userId + '/polls', { condition: condition, page: page }, { ignoreLoadingBar: true });
  };
  this.loadAdminUserComments = (userId, page, condition) => {
    return $http.post('/api/admins/users/' + userId + '/cmts', { condition: condition, page: page }, { ignoreLoadingBar: true });
  };
  this.loadAdminUserVotes = (userId, page, condition) => {
    return $http.post('/api/admins/users/' + userId + '/votes', { condition: condition, page: page }, { ignoreLoadingBar: true });
  };
  this.loadAdminUserLikes = (userId, page, condition) => {
    return $http.post('/api/admins/users/' + userId + '/likes', { condition: condition, page: page }, { ignoreLoadingBar: true });
  };
  this.loadAdminUserVieweds = (userId, page, condition) => {
    return $http.post('/api/admins/users/' + userId + '/viewed', { condition: condition, page: page }, { ignoreLoadingBar: true });
  };
  this.loadAdminUserSuggests = (userId, page, condition) => {
    return $http.post('/api/admins/users/' + userId + '/suggests', { condition: condition, page: page }, { ignoreLoadingBar: true });
  };
  this.loadAdminUserReports = (userId, page, condition) => {
    return $http.post('/api/admins/users/' + userId + '/reports', { condition: condition, page: page }, { ignoreLoadingBar: true });
  };
  this.loadAdminUserBeReports = (userId, page, condition) => {
    return $http.post('/api/admins/users/' + userId + '/bereports', { condition: condition, page: page }, { ignoreLoadingBar: true });
  };
  this.loadAdminUserBeReports = (userId, page, condition) => {
    return $http.post('/api/admins/users/' + userId + '/bereports', { condition: condition, page: page }, { ignoreLoadingBar: true });
  };
  this.pushVerifyUser = (userId) => {
    return $http.get('/api/admins/users/' + userId + '/pushVerify', { ignoreLoadingBar: true });
  };
  return this;
}
