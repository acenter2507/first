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
    this.loadProfileActivitys = userId => {
      return $http.get('/api/profile/' + userId + '/activitys/', { ignoreLoadingBar: true });
    };
    this.loadProfilePolls = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/polls/' + page, { ignoreLoadingBar: true });
    };
    this.loadProfileComments = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/cmts/' + page, { ignoreLoadingBar: true });
    };
    this.loadProfileLikedPolls = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/likes/' + page, { ignoreLoadingBar: true });
    };
    this.loadProfileDislikedPolls = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/dislikes/' + page, { ignoreLoadingBar: true });
    };
    this.loadProfileBookmarks = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/bookmarks/' + page, { ignoreLoadingBar: true });
    };
    this.loadProfileFollows = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/follows/' + page, { ignoreLoadingBar: true });
    };
    this.loadProfileVotes = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/votes/' + page, { ignoreLoadingBar: true });
    };
    this.loadProfileViews = (userId, page) => {
      return $http.get('/api/profile/' + userId + '/views/' + page, { ignoreLoadingBar: true });
    };
    this.loadTopUsers = (limit) => {
      return $http.get('/api/profile/top/' + limit, { ignoreLoadingBar: true });
    };
    this.deleteProfileBookmarks = userId => {
      return $http.get('/api/profile/' + userId + '/clear_bookmark', { ignoreLoadingBar: true });
    };
    this.deleteProfileViews = userId => {
      return $http.get('/api/profile/' + userId + '/clear_view', { ignoreLoadingBar: true });
    };
    this.deleteProfileFollows = userId => {
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
