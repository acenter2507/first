'use strict';

angular.module('users').controller('ProfileController', [
  '$scope',
  '$http',
  '$location',
  'Users',
  'Authentication',
  'userResolve',
  'UserApi',
  function ($scope, $http, $location, Users, Authentication, user, UserApi) {
    $scope.user = user;
    $scope.isCurrentOwner = user._id === Authentication.user._id;
    
    init();

    function init() {
      get_polls();
    }

    function get_polls() {
      UserApi.get_polls($scope.user._id)
        .success(res => {
          console.log(res);
        })
        .error(err => {
          console.log(err);
        });
    }
  }
]);
