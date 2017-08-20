'use strict';

angular.module('users').controller('ProfileController', [
  '$scope',
  'Authentication',
  'profileResolve',
  'Action',
  'Users',
  'toastr',
  '$timeout',
  'ngDialog',
  function ($scope, Authentication, profile, Action, Users, toast, $timeout, dialog) {
    $scope.profile = profile;
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
          $scope.$apply();
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    }
    function count_up_view_profile() {
      Action.count_up_view_profile($scope.report, $scope.profile._id);
    }

    $scope.delete_poll = (poll) => {
      if (!poll.isCurrentUserOwner) {
        toast.error('You are not authorized.', 'Error!');
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
        toast.error('You are already reported ' + poll.title, 'Error!');
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
            toast.success('You have successfully reported ' + poll.title, 'Thank you!');
          })
          .catch(err => {
            toast.error(err.message, 'Error!');
          });
      }
    };
    $scope.bookmark_poll = (poll) => {
      if (poll.bookmarked) {
        toast.error('You are already bookmark ' + poll.title, 'Error!');
        return;
      }
      if (!$scope.isLogged) {
        toast.error('You must login to follow poll.', 'Error!');
        return;
      }
      Action.save_bookmark(poll._id)
        .then(res => {
          poll.bookmarked = (res) ? true : false;
          toast.success('Added ' + poll.title + ' to bookmarks.', 'Success!');
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    };
    $scope.follow_poll = poll => {
      if (!$scope.isLogged) {
        toast.error('You must login to follow poll.', 'Error!');
        return;
      }
      Action.save_follow(poll.follow)
        .then(res => {
          if (res) {
            poll.follow = res;
            toast.success('You followed ' + poll.title, 'Success!');
          } else {
            poll.follow = { poll: poll._id };
          }
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    };
  }
]);
