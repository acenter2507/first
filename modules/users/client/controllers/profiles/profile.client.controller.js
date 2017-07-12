'use strict';

angular.module('users').controller('ProfileController', [
  '$scope',
  'Authentication',
  'profileResolve',
  'Action',
  'Users',
  'toastr',
  '$timeout',
  function ($scope, Authentication, profile, Action, Users, toast, $timeout) {
    $scope.profile = profile;
    $scope.user = Authentication.user;
    $scope.isCurrentOwner = profile._id === $scope.user._id;
    $scope.isLogged = ($scope.user) ? true : false;

    init();

    function init() {
      get_user_report();

      var timer = $timeout(count_up_view_profile, 30000);
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
    function count_up_view_profile() {
      Action.count_up_view_profile($scope.report);
    }
  }
]);
