'use strict';

angular.module('users').controller('ProfileController', [
  '$scope',
  'Authentication',
  'profileResolve',
  '$timeout',
  'Users',
  function ($scope, Authentication, profile, $timeout, Users) {
    $scope.profile = profile;
    $scope.user = Authentication.user;
    $scope.isCurrentOwner = profile._id === $scope.user._id;
    $scope.isLogged = ($scope.user) ? true : false;

    if ($scope.isLogged && !$scope.isCurrentOwner) {
      var _user = new Users($scope.user);
      _user.viewCnt += 1;
      _user.$update(console.log('count_up'));
    }
  }
]);
