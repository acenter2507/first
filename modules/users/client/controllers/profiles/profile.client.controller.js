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
    $scope.isCurrentOwner = $scope.profile._id === $scope.user._id;
    init();

    function init() {
      get_user_report();
      if ($scope.isLogged && !$scope.isCurrentOwner) {
        var timer = $timeout(count_up_view_profile, 30000);
        $scope.$on('$destroy', () => {
          $timeout.cancel(timer);
        });
      }

    }

    function get_user_report() {
      Action.get_user_report($scope.profile._id)
        .then(res => {
          $scope.report = res.data || { viewCnt: 0, pollCnt: 0, cmtCnt: 0 };
        })
        .catch(err => {
          $scope.show_error(err.message);
        });
    }
    function count_up_view_profile() {
      Action.count_up_view_profile($scope.report, $scope.profile._id);
    }

    $scope.delete_poll = (poll) => {
      if (!poll.isCurrentUserOwner) {
        $scope.show_error('MS_CM_AUTH_ERROR');
        return;
      }
      $scope.message_title = 'Delete poll!';
      $scope.message_content = 'Are you sure you want to delete this poll?';
      $scope.dialog_type = 3;
      $scope.buton_label = 'delete';
      dialog.openConfirm({
        scope: $scope,
        templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
      }).then(confirm => {
        handle_delete();
      }, reject => {
      });
      function handle_delete() {
        $scope.polls = _.without($scope.polls, poll);
        Action.delete_poll(poll);
      }
    };
    $scope.report_poll = poll => {
      if (poll.reported) {
        $scope.show_message_params('MS_CM_REPORT_EXIST_ERROR', { title: poll.title }, true);
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
            $scope.show_message_params('MS_CM_REPORT_SUCCESS', { title: poll.title }, false);
          })
          .catch(err => {
            $scope.show_error(err.message);
          });
      }
    };
    $scope.bookmark_poll = (poll) => {
      if (poll.bookmarked) {
        $scope.show_message_params('MS_CM_BOOKMARK_EXIST_ERROR', { title: poll.title }, true);
        return;
      }
      if (!$scope.isLogged) {
        $scope.show_error('MS_CM_LOGIN_ERROR');
        return;
      }
      Action.save_bookmark(poll._id)
        .then(res => {
          poll.bookmarked = (res) ? true : false;
          $scope.show_message_params('MS_CM_BOOKMARK_SUCCESS', { title: poll.title }, false);
        })
        .catch(err => {
          $scope.show_error(err.message);
        });
    };
    $scope.follow_poll = poll => {
      if (!$scope.isLogged) {
        $scope.show_error('MS_CM_LOGIN_ERROR');
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
          $scope.show_error(err.message);
        });
    };
  }
]);
