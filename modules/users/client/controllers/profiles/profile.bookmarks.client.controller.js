'use strict';

angular.module('users').controller('ProfileBookmarksController', [
  '$scope',
  'UserApi',
  'Action',
  'ngDialog',
  'toastr',
  function ($scope, UserApi, Action, dialog, toast) {
    $scope.screen = 'profile-bookmark';
    $scope.polls = [];
    $scope.page = 0;
    $scope.busy = false;
    $scope.stopped = false;

    $scope.get_polls = get_polls;
    function get_polls() {
      if ($scope.busy || $scope.stopped) return;
      $scope.busy = true;
      UserApi.get_bookmarks($scope.profile._id, $scope.page)
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

    $scope.remove_bookmark = poll => {
      $scope.message_title = 'Remove bookmark!';
      $scope.message_content = 'Are you sure you want to remove this poll from bookmark?';
      $scope.dialog_type = 3;
      $scope.buton_label = 'remove';
      dialog.openConfirm({
        scope: $scope,
        templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
      }).then(confirm => {
        handle_delete();
      }, reject => {
      });
      function handle_delete() {
        $scope.polls = _.without($scope.polls, poll);
        Action.remove_bookmark(poll._id);
      }
    };

    $scope.clear_bookmark = () => {
      if (!$scope.isCurrentOwner) return;
      UserApi.clear_bookmark($scope.profile._id);
      $scope.polls = [];
    };
  }
]);
