'use strict';

angular.module('users').controller('ProfileInfoController', [
  '$scope',
  'UserApi',
  'Action',
  function ($scope, UserApi, Action) {
    $scope.polls = [];
    $scope.cmts = [];
    $scope.votes = [];
    $scope.activitys = [];

    $scope.page = 0;
    $scope.busy = false;
    $scope.stoped = false;

    get_data();
    function get_data() {
      Promise.all([ get_polls(), get_cmts(), get_votes() ])
        .then(res => {
          console.log(res);
          merge_activity();
          console.log($scope.activitys);
        })
        .catch(err => {
          alert(err);
        });
    }

    function get_polls() {
      return new Promise((resolve, reject) => {
        UserApi.get_polls($scope.profile._id, $scope.page)
          .success(res => {
            $scope.polls = res || [];
            return resolve(res);
          })
          .error(err => {
            return reject(err);
          });
      });
    }
    function get_cmts() {
      return new Promise((resolve, reject) => {
        UserApi.get_cmts($scope.profile._id, $scope.page)
          .success(res => {
            $scope.cmts = res || [];
            return resolve(res);
          })
          .error(err => {
            return reject(err);
          });
      });
    }
    function get_votes() {
      return new Promise((resolve, reject) => {
        UserApi.get_votes($scope.profile._id, $scope.page)
          .success(res => {
            $scope.votes = res || [];
            var promises = [];
            $scope.votes.forEach(vote => {
              promises.push(get_opts(vote));
            });
            Promise.all(promises)
              .then(res => {
                return resolve(res);
              })
              .catch(err => {
                return reject(err);
              });
          })
          .error(err => {
            return reject(err);
          });
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

    function merge_activity() {
      $scope.polls.forEach(function(poll) {
        if (poll) {
          $scope.activitys.push({
            _id: poll._id,
            title: poll.title,
            body: poll.body,
            created: poll.created,
            isPublic: poll.isPublic,
            opts: null
          });
        }
      });
      $scope.cmts.forEach(function(cmt) {
        if (cmt) {
          $scope.activitys.push({
            _id: (cmt.poll) ? cmt.poll._id : null,
            title: (cmt.poll) ? cmt.poll.title : '',
            body: cmt.body,
            created: cmt.created,
            isPublic: (cmt.poll) ? cmt.poll.isPublic : false,
            opts: null
          });
        }
      });
      $scope.votes.forEach(function(vote) {
        if (vote) {
          $scope.activitys.push({
            _id: (vote.poll) ? vote.poll._id : null,
            title: (vote.poll) ? vote.poll.title : '',
            body: null,
            created: vote.created,
            isPublic: (vote.poll) ? vote.poll.isPublic : false,
            opts: vote.opts
          });
        }
      });
    }
  }
]);
