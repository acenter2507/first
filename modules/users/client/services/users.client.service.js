'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

angular.module('users').factory('Userreport', ['$resource',
  function ($resource) {
    return $resource('api/userreports/:userreportId', {
      userreportId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

angular.module('users').factory('Profile', ['$resource',
  function ($resource) {
    return $resource('api/profile/:userId', {}, {
      userId: '@_id'
    });
  }
]);

angular.module('users').factory('UserApi', ['$http',
  function ($http) {
    this.get_polls = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/polls/' + page);
    };
    this.get_cmts = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/cmts/' + page);
    };
    this.get_likes = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/likes/' + page);
    };
    this.get_dislikes = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/dislikes/' + page);
    };
    this.get_bookmarks = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/bookmarks/' + page);
    };
    this.get_follows = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/follows/' + page);
    };
    this.get_votes = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/votes/' + page);
    };
    this.get_views = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/views/' + page);
    };
    this.get_user_report = userId => {
      return $http.get('/api/profile/' + userId + '/report');
    };
    return this;
  }
]);
