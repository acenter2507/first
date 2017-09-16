'use strict';

angular.module('users').controller('ProfileBookmarksController', [
  '$scope',
  'UserApi',
  'Action',
  'ngDialog',
  function ($scope, UserApi, Action, dialog) {
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
          results = results || [];
          $scope.polls = _.union($scope.polls, results);
          $scope.page += 1;
          $scope.busy = false;
        })
        .catch(err => {
          $scope.busy = false;
          $scope.stopped = true;
          $scope.show_message(err.message, true);
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
      $scope.message = {};
      $scope.message.content = 'LB_POLLS_CONFIRM_BOOKMARK';
      $scope.message.type = 3;
      $scope.message.buton = 'LB_DELETE';
      dialog.openConfirm({
        scope: $scope,
        templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
      }).then(confirm => {
        handle_delete();
      }, reject => {
        delete $scope.message;
      });
      function handle_delete() {
        delete $scope.message;
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
