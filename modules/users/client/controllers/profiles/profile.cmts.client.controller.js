'use strict';

angular.module('users').controller('ProfileCmtsController', [
  '$scope',
  'ProfileApi',
  function ($scope, ProfileApi) {
    $scope.cmts = [];
    $scope.page = 0;
    $scope.busy = false;
    $scope.stopped = false;

    $scope.get_cmts = get_cmts;
    function get_cmts() {
      if ($scope.busy || $scope.stopped) return;
      $scope.busy = true;
      ProfileApi.get_cmts($scope.profile._id, $scope.page)
        .success(res => {
          if (!res || !res.length || res.length === 0) {
            $scope.busy = false;
            $scope.stopped = true;
            return;
          }
          $scope.cmts = _.union($scope.cmts, res);
          $scope.page += 1;
          $scope.busy = false;
        })
        .error(err => {
          $scope.handleShowMessage(err.message, true);
        });
    }
    $scope.cmt_filter = cmt => {
      if (cmt.poll.isPublic) {
        return true;
      } else {
        return $scope.isCurrentOwner;
      }
    };
  }
]);
