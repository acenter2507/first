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
    $scope.isLogged = (Authentication.user) ? true : false;
    $scope.page = 0;
    
    init();

    function init() {
      get_polls();
    }

    function get_polls() {
      UserApi.get_polls($scope.user._id, $scope.page)
        .success(res => {
          $scope.polls = res || [];
        })
        .error(err => {
          alert(err);
        });
    }

    $scope.poll_filter = (poll) => {
      if (poll.isPublic) {
        return true;
      } else {
        return $scope.isCurrentOwner;
      }
    };
  }
]);
