'use strict';

angular.module('users').controller('ProfileCmtsController', [
  '$scope',
  'UserApi',
  function($scope, UserApi) {
    $scope.cmts = [];
    $scope.page = 0;
    $scope.busy = false;
    $scope.stoped = false;
    $scope.get_cmts = get_cmts;
    
    init();

    function init() {
      get_cmts();
    }

    function get_cmts() {
      if ($scope.busy || $scope.stoped) {
        return;
      }
      $scope.busy = true;
      UserApi.get_cmts($scope.profile._id, $scope.page)
        .success(res => {
          if (!res || !res.length || res.length === 0) {
            $scope.busy = false;
            $scope.stoped = true;
            return;
          }
          $scope.cmts = _.union($scope.cmts, res);
          $scope.page += 1;
          $scope.busy = false;
          $scope.$apply();
        })
        .error(err => {
          alert(err);
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
