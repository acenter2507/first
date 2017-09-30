'use strict';

angular.module('users').controller('ProfileController', [
  '$scope',
  'profileResolve',
  'Action',
  'Users',
  '$timeout',
  'ngDialog',
  function ($scope, profile, Action, Users, $timeout, dialog) {
    $scope.profile = profile;
    console.log($scope.profile);
    $scope.isCurrentOwner = $scope.profile._id === $scope.user._id;
    onCreate();

    function onCreate() {
      if ($scope.isLogged && !$scope.isCurrentOwner) {
        var timer = $timeout(handleCountUpBeView, 30000);
        $scope.$on('$destroy', () => {
          $timeout.cancel(timer);
          timer = undefined;
        });
      }

    }

    // Tăng biến đếm số lần xem profile
    function handleCountUpBeView() {
      Action.handleCountUpBeView($scope.profile._id);
    }

    $scope.delete_poll = (poll) => {
      if (!poll.isCurrentUserOwner) {
        $scope.handleShowMessage('MS_CM_AUTH_ERROR', true);
        return;
      }
      // Gọi function show dialog từ scope cha
      $scope.handleShowConfirm({
        content: 'LB_POLLS_CONFIRM_BOOKMARK',
        type: 3,
        button: 'LB_DELETE'
      }, confirm => {
        $scope.polls = _.without($scope.polls, poll);
        Action.delete_poll(poll);
      });
    };
    $scope.report_poll = poll => {
      if (poll.reported) {
        $scope.handleShowMessageWithParam('MS_CM_REPORT_EXIST_ERROR', { title: poll.title }, true);
        return;
      }
      dialog.openConfirm({
        scope: $scope,
        templateUrl: 'modules/core/client/views/templates/report.dialog.template.html'
      }).then(reason => {
        handle_confirm(reason);
      }, reject => {
      });
      function handle_confirm(reason) {
        Action.save_report(poll, reason)
          .then(res => {
            poll.reported = (res) ? true : false;
            $scope.handleShowMessageWithParam('MS_CM_REPORT_SUCCESS', { title: poll.title }, false);
          })
          .catch(err => {
            $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
          });
      }
    };
    $scope.bookmark_poll = (poll) => {
      if (poll.bookmarked) {
        $scope.handleShowMessageWithParam('MS_CM_BOOKMARK_EXIST_ERROR', { title: poll.title }, true);
        return;
      }
      if (!$scope.isLogged) {
        $scope.handleShowMessage('MS_CM_LOGIN_ERROR', true);
        return;
      }
      Action.save_bookmark(poll._id)
        .then(res => {
          poll.bookmarked = (res) ? true : false;
          $scope.handleShowMessageWithParam('MS_CM_BOOKMARK_SUCCESS', { title: poll.title }, false);
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    };
    $scope.follow_poll = poll => {
      if (!$scope.isLogged) {
        $scope.handleShowMessage('MS_CM_LOGIN_ERROR', true);
        return;
      }
      Action.save_follow(poll.follow)
        .then(res => {
          if (res) {
            poll.follow = res;
          } else {
            poll.follow = { poll: poll._id };
          }
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    };
  }
]);
