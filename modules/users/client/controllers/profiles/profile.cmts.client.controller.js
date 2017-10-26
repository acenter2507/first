'use strict';

angular.module('users').controller('ProfileCmtsController', [
  '$scope',
  'ProfileApi',
  function ($scope, ProfileApi) {
    $scope.cmts = [];
    $scope.page = 1;
    $scope.busy = false;
    $scope.stopped = false;

    $scope.loadComments = () => {
      if ($scope.busy || $scope.stopped) return;
      $scope.busy = true;
      ProfileApi.loadProfileComments($scope.profile._id, $scope.page)
        .success(res => {
          if (!res || !res.length || res.length === 0) {
            $scope.busy = false;
            $scope.stopped = true;
            return;
          }
          $scope.cmts = _.union($scope.cmts, res);
          $scope.page += 1;
          $scope.busy = false;
          if (res.length < 10) $scope.stopped = true;
          if (!$scope.$$phase) $scope.$digest();
        })
        .error(err => {
          $scope.handleShowMessage(err.message || err.data.message, true);
        });
    };
    $scope.cmt_filter = cmt => {
      if (cmt.poll.isPublic) {
        return true;
      } else {
        return $scope.isCurrentOwner;
      }
    };
  }
]);
