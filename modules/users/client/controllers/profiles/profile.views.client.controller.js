'use strict';

angular.module('users').controller('ProfileViewsController', [
  '$scope',
  'ProfileApi',
  'Action',
  'ngDialog',
  function ($scope, ProfileApi, Action, dialog) {
    $scope.screen = 'profile-view';
    $scope.polls = [];
    $scope.page = 0;
    $scope.busy = false;
    $scope.stopped = false;

    $scope.get_polls = get_polls;
    function get_polls() {
      if ($scope.busy || $scope.stopped) return;
      $scope.busy = true;
      ProfileApi.loadProfileViews($scope.profile._id, $scope.page)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            $scope.busy = false;
            $scope.stopped = true;
            return;
          }
          var promises = [];
          res.data.forEach(poll => {
            promises.push(prepareShowingData(poll));
          });
          return Promise.all(promises);
        })
        .then(results => {
          // Gán data vào list hiện tại
          results = results || [];
          $scope.polls = _.union($scope.polls, results);
          $scope.page += 1;
          $scope.busy = false;
        })
        .catch(err => {
          $scope.busy = false;
          $scope.stopped = true;
          $scope.handleShowMessage(err.message, true);
        });
    }
    function prepareShowingData(poll) {
      return new Promise((resolve, reject) => {
        poll = Action.prepareShowingData(poll);
        return resolve(poll);
      });
    }
    $scope.poll_filter = poll => {
      if (poll.isPublic) {
        return true;
      } else {
        return $scope.isCurrentOwner;
      }
    };

    $scope.clear_view = () => {
      if (!$scope.isCurrentOwner) return;
      ProfileApi.deleteProfileViews($scope.profile._id);
      $scope.polls = [];
    };
  }
]);
