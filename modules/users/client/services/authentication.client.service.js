'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function($window) {
    var auth = {
      user: $window.user,
      isAdmin: () => {
        return ($window.user && $window.user.roles.indexOf('admin') > -1);
      }
    };
    return auth;
  }
]);
