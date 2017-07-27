'use strict';

//TODO this should be Users service
angular.module('admin')
  .factory('Admin', admin)
  .factory('AdminApi', AdminApi);

admin.$inject = ['$resource'];
function admin($resource) {
  return $resource('api/users/:aduserId', { aduserId: '@_id' }, {
    update: {
      method: 'PUT'
    }
  });
}
AdminApi.$inject = ['$http'];
function AdminApi($http) {
  this.get_users = () => {
    return $http.get('/api/admins/users');
  };
  // this.user_report = userId => {
  //   return $http.get('/api/admins/users/' + userId + '/report');
  // };
  // this.user_reported = userId => {
  //   return $http.get('/api/admins/users/' + userId + '/reported');
  // };
  this.reset_pass = (userId, pass) => {
    return $http.post('/api/admins/users/' + userId + '/resetpass', { password: pass });
  };
  this.get_polls_by_user = userId => {
    return $http.get('/api/admins/users/' + userId + '/polls');
  };
  this.get_cmts_by_user = userId => {
    return $http.get('/api/admins/users/' + userId + '/cmts');
  };
  this.get_votes_by_user = userId => {
    return $http.get('/api/admins/users/' + userId + '/votes');
  };
  this.get_reports_by_user = userId => {
    return $http.get('/api/admins/users/' + userId + '/reports');
  };
  this.get_bereports_by_user = userId => {
    return $http.get('/api/admins/users/' + userId + '/bereports');
  };
  this.get_suggests_by_user = userId => {
    return $http.get('/api/admins/users/' + userId + '/suggests');
  };
  this.get_logins_by_user = userId => {
    return $http.get('/api/admins/users/' + userId + '/logins');
  };
  return this;
}
