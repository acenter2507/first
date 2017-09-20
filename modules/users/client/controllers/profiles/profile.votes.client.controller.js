'use strict';

angular.module('users').controller('ProfileVotesController', [
  '$scope',
  'UserApi',
  'Action',
  function ($scope, UserApi, Action) {
    $scope.votes = [];
    $scope.page = 0;
    $scope.busy = false;
    $scope.stopped = false;

    $scope.get_votes = get_votes;
    function get_votes() {
      if ($scope.busy || $scope.stopped) return;
      $scope.busy = true;
      UserApi.get_votes($scope.profile._id, $scope.page)
        .success(res => {
          if (!res || !res.length || res.length === 0) {
            $scope.busy = false;
            $scope.stopped = true;
            return;
          }
          $scope.votes = _.union($scope.votes, res);
          $scope.page += 1;
          $scope.busy = false;
        })
        .error(err => {
          $scope.handleShowMessage(err.message, true);
        });
    }
    $scope.vote_filter = vote => {
      if (vote.poll.isPublic) {
        return true;
      } else {
        return $scope.isCurrentOwner;
      }
    };
  }
]);
