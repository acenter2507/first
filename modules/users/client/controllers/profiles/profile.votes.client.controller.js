'use strict';

angular.module('users').controller('ProfileVotesController', [
  '$scope',
  'UserApi',
  'Action',
  function($scope, UserApi, Action) {
    $scope.votes = [];
    $scope.page = 0;
    $scope.busy = false;
    $scope.stoped = false;
    $scope.new_data = [];

    init();

    function init() {}

    $scope.get_votes = get_votes;
    function get_votes() {
      if ($scope.busy || $scope.stoped) {
        return;
      }
      $scope.busy = true;
      UserApi.get_votes($scope.profile._id, $scope.page)
        .success(res => {
          if (!res || !res.length || res.length === 0) {
            $scope.busy = false;
            $scope.stoped = true;
            return;
          }
          $scope.new_data = res || [];
          var promises = [];
          $scope.new_data.forEach(vote => {
            promises.push(get_opts(vote));
          });
          Promise.all(promises)
            .then(res => {
              // Gán data vào list hiện tại
              $scope.votes = _.union($scope.votes, $scope.new_data);
              console.log($scope.new_data);
              $scope.page += 1;
              $scope.busy = false;
              $scope.new_data = [];
            })
            .catch(err => {
              alert(err);
            });
        })
        .error(err => {
          alert(err);
        });
    }
    function get_opts(vote) {
      return new Promise((resolve, reject) => {
        Action.get_opts_for_vote(vote._id)
          .then(res => {
            vote.opts = _.pluck(res.data, 'opt') || [];
            return resolve(vote);
          })
          .catch(err => {
            return reject(err);
          });
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
