'use strict';

//TODO this should be Users service
angular.module('admin')
  .factory('Admin', admin)
  .factory('AdminApi', AdminApi);

admin.$inject = ['$resource'];
function admin($resource) {
  return $resource('api/users/:userId', {
    userId: '@_id'
  }, {
      update: {
        method: 'PUT'
      }
    });
}
AdminApi.$inject = ['$http'];
function AdminApi($http) {
  this.user_report = userId => {
    return $http.get('/api/admins/users/' + userId + '/report');
  };
}
// angular.module('admin').factory('AdminApi', ['$http',
//   function ($http) {
//     this.get_polls = (userId, page) => {
//       return $http.get('/api/profile/' + userId + '/polls/' + page);
//     };
//     this.get_cmts = (userId, page) => {
//       return $http.get('/api/profile/' + userId + '/cmts/' + page);
//     };
//     this.get_likes = (userId, page) => {
//       return $http.get('/api/profile/' + userId + '/likes/' + page);
//     };
//     this.get_dislikes = (userId, page) => {
//       return $http.get('/api/profile/' + userId + '/dislikes/' + page);
//     };
//     this.get_bookmarks = (userId, page) => {
//       return $http.get('/api/profile/' + userId + '/bookmarks/' + page);
//     };
//     this.get_follows = (userId, page) => {
//       return $http.get('/api/profile/' + userId + '/follows/' + page);
//     };
//     this.get_votes = (userId, page) => {
//       return $http.get('/api/profile/' + userId + '/votes/' + page);
//     };
//     this.get_views = (userId, page) => {
//       return $http.get('/api/profile/' + userId + '/views/' + page);
//     };
//     this.get_user_report = userId => {
//       return $http.get('/api/profile/' + userId + '/report');
//     };
//     return this;
//   }
// ]);
