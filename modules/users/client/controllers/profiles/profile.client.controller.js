'use strict';

angular.module('users').controller('ProfileController', [
  '$scope',
  '$http',
  '$location',
  'Users',
  'Authentication',
  'profileResolve'
  function ($scope, $http, $location, Users, Authentication, profile) {
    $scope.profile = profile;
    $scope.isCurrentOwner = profile._id === Authentication.user._id;
    $scope.isLogged = (Authentication.user) ? true : false;
  
  }
]);
