'use strict';

angular.module('users').controller('ProfileVotesController', [
  '$scope',
  'ProfileApi',
  'Action',
  function ($scope, ProfileApi, Action) {
    $scope.votes = [];
    $scope.page = 1;
    $scope.busy = false;
    $scope.stopped = false;

    $scope.loadVotes = () => {
      if ($scope.busy || $scope.stopped) return;
      $scope.busy = true;
      ProfileApi.loadProfileVotes($scope.profile._id, $scope.page)
        .success(res => {
          if (!res || !res.length || res.length === 0) {
            $scope.busy = false;
            $scope.stopped = true;
            return;
          }
          $scope.votes = _.union($scope.votes, res);
          $scope.page += 1;
          $scope.busy = false;
          if (res.length < 10) $scope.stopped = true;
        })
        .error(err => {
          $scope.handleShowMessage(err.message || err.data.message, true);
        });
    };
    $scope.vote_filter = vote => {
      if (vote.poll.isPublic) {
        return true;
      } else {
        return $scope.isCurrentOwner;
      }
    };
  }
]);
