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
      if ($scope.isLogged && !$scope.isCurrentOwner) {
        var timer = $timeout(count_up_view_profile, 30000);
      }
    }

    function get_user_report() {
      Action.get_user_report($scope.profile._id)
        .then(res => {
          $scope.report = res.data || { viewCnt: 0, pollCnt: 0, cmtCnt: 0 };
          $scope.$apply();
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    }
    function count_up_view_profile() {
      Action.count_up_view_profile($scope.report, $scope.profile._id);
    }
  }
]);
