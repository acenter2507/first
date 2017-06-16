'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function($window) {
    var auth = {
      user: $window.user,
      isAdmin: () => {
      	console.log($window.user);
      	if (!$window.user || !$window.user.roles || !$window.user.roles.length) {
      		return false;
      	} else {
      		return ($window.user.roles.indexOf('admin') > -1);
      	}
      }
    };
    return auth;
  }
]);
