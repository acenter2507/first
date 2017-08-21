'use strict';

angular.module('users').controller('ProfileInfoController', [
  '$scope',
  'UserApi',
  'Action',
  'toastr',
  function ($scope, UserApi, Action, toast) {
    $scope.polls = [];
    $scope.cmts = [];
    $scope.votes = [];
    $scope.activitys = [];

    $scope.busy = false;

    get_data();
    function get_data() {
      if ($scope.busy) return;
      $scope.busy = true;
      UserApi.get_activitys($scope.profile._id)
        .then(res => {
          $scope.polls = res.data.polls;
          $scope.cmts = res.data.cmts;
          $scope.votes = res.data.votes;
          merge_activity();
          $scope.busy = false;
        }, err => {
          toast.error('Can\'t load user info ' + err.message, 'Error!');
        });
    }

    function merge_activity() {
      $scope.polls.forEach(function (poll) {
        if (poll) {
          $scope.activitys.push({
            _id: poll._id,
            title: poll.title,
            body: poll.body,
            slug: poll.slug,
            created: poll.created,
            isPublic: poll.isPublic,
            opts: null,
            type: 1
          });
        }
      });
      $scope.cmts.forEach(function (cmt) {
        if (cmt && cmt.poll) {
          $scope.activitys.push({
            _id: cmt.poll ? cmt.poll._id : null,
            title: cmt.poll ? cmt.poll.title : '',
            body: cmt.body,
            slug: cmt.poll.slug,
            created: cmt.created,
            isPublic: cmt.poll ? cmt.poll.isPublic : false,
            opts: null,
            type: 2
          });
        }
      });
      $scope.votes.forEach(function (vote) {
        if (vote && vote.poll) {
          $scope.activitys.push({
            _id: vote.poll ? vote.poll._id : null,
            title: vote.poll ? vote.poll.title : '',
            body: null,
            slug: vote.poll.slug,
            created: vote.created,
            isPublic: vote.poll ? vote.poll.isPublic : false,
            opts: vote.opts,
            type: 3
          });
        }
      });
    }

    $scope.activity_filter = (activity) => {
      if (activity.isPublic) return true;
      return $scope.isCurrentOwner;
    };
  }
]);
