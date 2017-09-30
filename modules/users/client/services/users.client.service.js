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

angular.module('users').factory('Profile', ['$resource',
  function ($resource) {
    return $resource('api/profile/:userId', {}, {
      userId: '@_id'
    });
  }
]);

angular.module('users').factory('ProfileApi', ['$http',
  function ($http) {
    // Lấy list activitys của user
    this.get_activitys = userId => {
      return $http.get('/api/profile/' + userId + '/activitys/', { ignoreLoadingBar: true });
    };
    this.get_polls = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/polls/' + page, { ignoreLoadingBar: true });
    };
    this.get_cmts = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/cmts/' + page, { ignoreLoadingBar: true });
    };
    this.get_likes = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/likes/' + page, { ignoreLoadingBar: true });
    };
    this.get_dislikes = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/dislikes/' + page, { ignoreLoadingBar: true });
    };
    this.get_bookmarks = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/bookmarks/' + page, { ignoreLoadingBar: true });
    };
    this.get_follows = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/follows/' + page, { ignoreLoadingBar: true });
    };
    this.get_votes = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/votes/' + page, { ignoreLoadingBar: true });
    };
    this.get_views = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/views/' + page, { ignoreLoadingBar: true });
    };
    this.loadTopUsers = (limit) => {
      return $http.get('/api/profile/top/' + limit, { ignoreLoadingBar: true });
    };
    this.clear_bookmark = userId => {
      return $http.get('/api/profile/' + userId + '/clear_bookmark', { ignoreLoadingBar: true });
    };
    this.clear_view = userId => {
      return $http.get('/api/profile/' + userId + '/clear_view', { ignoreLoadingBar: true });
    };
    this.clear_follow = userId => {
      return $http.get('/api/profile/' + userId + '/clear_follow', { ignoreLoadingBar: true });
    };
    this.countUpBeView = userId => {
      return $http.get('/api/profile/' + userId + '/be_view', { ignoreLoadingBar: true });
    };
    this.search_user_by_name = name => {
      return $http.get('/api/users/search/s=' + name, {
        ignoreLoadingBar: true
      });
    };
    return this;
  }
]);
