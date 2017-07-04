'use strict';

angular.module('users').controller('ProfileController', [
  '$scope',
  '$http',
  '$location',
  'Users',
  'Authentication',
  'userResolve',
  function ($scope, $http, $location, Users, Authentication, user) {
    $scope.user = user;
    $scope.isCurrentOwner = user._id === Authentication.user._id;
  }
]);
