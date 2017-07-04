'use strict';

angular.module('users').controller('ProfileController', [
  '$scope',
  'Authentication',
  'profileResolve',
  function ($scope, Authentication, profile) {
    $scope.profile = profile;
    $scope.user = Authentication.user;
    $scope.isCurrentOwner = profile._id === $scope.user._id;
    $scope.isLogged = ($scope.user) ? true : false;
  }
]);
