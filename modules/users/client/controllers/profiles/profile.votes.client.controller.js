'use strict';

angular.module('users').controller('ProfileVotesController', [
  '$scope',
  'UserApi',
  'Action',
  'toastr',
  function ($scope, UserApi, Action, toast) {
    $scope.votes = [];
    $scope.page = 0;
    $scope.busy = false;
    $scope.stopped = false;
    $scope.new_data = [];

    $scope.get_votes = get_votes;
    function get_votes() {
      if ($scope.busy || $scope.stopped) {
        return;
      }
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
          toast.error(err.message, 'Error!');
        });
    }
    // function get_opts(vote) {
    //   return new Promise((resolve, reject) => {
    //     Action.get_opts_for_vote(vote._id)
    //       .then(res => {
    //         vote.opts = _.pluck(res.data, 'opt') || [];
    //         return resolve(vote);
    //       })
    //       .catch(err => {
    //         return reject(err);
    //       });
    //   });
    // }
    $scope.vote_filter = vote => {
      if (vote.poll.isPublic) {
        return true;
      } else {
        return $scope.isCurrentOwner;
      }
    };
  }
]);
