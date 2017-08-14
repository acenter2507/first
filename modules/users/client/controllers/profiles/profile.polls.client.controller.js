'use strict';

angular.module('users').controller('ProfilePollsController', [
  '$scope',
  'UserApi',
  'Action',
  'ngDialog',
  'toastr',
  function ($scope, UserApi, Action, dialog, toast) {
    $scope.screen = 'profile-polls';
    $scope.polls = [];
    $scope.page = 0;
    $scope.busy = false;
    $scope.stopped = false;

    $scope.get_polls = get_polls;
    function get_polls() {
      if ($scope.busy || $scope.stopped) return;
      $scope.busy = true;
      UserApi.get_polls($scope.profile._id, $scope.page)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            $scope.busy = false;
            $scope.stopped = true;
            return;
          }
          var promises = [];
          res.data.forEach(poll => {
            promises.push(process_before_show(poll));
          });
          return Promise.all(promises);
        })
        .then(results => {
          // Gán data vào list hiện tại
          $scope.polls = _.union($scope.polls, results);
          $scope.page += 1;
          $scope.busy = false;
        })
        .catch(err => {
          $scope.busy = false;
          $scope.stopped = true;
          toast.error(err.message, 'Error!');
        });
    }
    function process_before_show(poll) {
      return new Promise((resolve, reject) => {
        poll = Action.process_before_show(poll);
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

    // $scope.follow_poll = poll => {
    //   if (!$scope.isLogged) {
    //     toast.error('You must login to follow poll.', 'Error!');
    //     return;
    //   }
    //   Action.save_follow(poll.follow)
    //     .then(res => {
    //       if (res) {
    //         poll.follow = res;
    //         toast.success('You followed ' + poll.title, 'Success!');
    //       } else {
    //         poll.follow = { poll: poll._id };
    //       }
    //     })
    //     .catch(err => {
    //       toast.error(err.message, 'Error!');
    //     });
    // };
    // $scope.report_poll = poll => {
    //   if (poll.reported) {
    //     toast.error('You are already reported ' + poll.title, 'Error!');
    //     return;
    //   }
    //   dialog.openConfirm({
    //     scope: $scope,
    //     templateUrl: 'modules/core/client/views/templates/report.dialog.template.html'
    //   }).then(reason => {
    //     handle_confirm(reason);
    //   }, reject => {
    //   });
    //   function handle_confirm(reason) {
    //     Action.save_report(poll, reason)
    //       .then(res => {
    //         poll.reported = (res) ? true : false;
    //         toast.success('You have successfully reported ' + poll.title, 'Thank you!');
    //       })
    //       .catch(err => {
    //         toast.error(err.message, 'Error!');
    //       });
    //   }
    // };
    // $scope.bookmark_poll = poll => {
    //   if (poll.bookmarked) {
    //     toast.error('You are already bookmark ' + poll.title, 'Error!');
    //     return;
    //   }
    //   Action.save_bookmark(poll._id)
    //     .then(res => {
    //       poll.bookmarked = (res) ? true : false;
    //       $scope.$apply();
    //       toast.success('Added ' + poll.title + ' to bookmarks.', 'Success!');
    //     })
    //     .catch(err => {
    //       toast.error(err.message, 'Error!');
    //     });
    // };
    // $scope.delete_poll = (poll) => {
    //   if (!poll.isCurrentUserOwner) {
    //     toast.error('You are not authorized.', 'Error!');
    //     return;
    //   }
    //   $scope.message_title = 'Delete poll!';
    //   $scope.message_content = 'Are you sure you want to delete this poll?';
    //   $scope.dialog_type = 3;
    //   $scope.buton_label = 'delete';
    //   dialog.openConfirm({
    //     scope: $scope,
    //     templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
    //   }).then(confirm => {
    //     handle_delete();
    //   }, reject => {
    //   });
    //   function handle_delete() {
    //     $scope.polls = _.without($scope.polls, poll);
    //     Action.delete_poll(poll);
    //   }
    // };
  }
]);
