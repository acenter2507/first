'use strict';

angular.module('users').controller('ProfileController', [
  '$scope',
  'Authentication',
  'profileResolve',
  'Action',
  'Users',
  'toastr',
  function ($scope, Authentication, profile, Action, Users, toast) {
    $scope.profile = profile;
    $scope.user = Authentication.user;
    $scope.isCurrentOwner = profile._id === $scope.user._id;
    $scope.isLogged = ($scope.user) ? true : false;

    function init() {
      get_user_report();
    }

    function get_user_report() {
      Action.get_user_report()
        .then(res => {
          $scope.report = res.data || {};
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    }
  }
]);
