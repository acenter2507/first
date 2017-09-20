(function () {
  'use strict';

  // Tags controller
  angular
    .module('tags')
    .controller('PollsTagController', PollsTagController);

  PollsTagController.$inject = [
    '$scope',
    '$state',
    '$window',
    'Authentication',
    'tagResolve',
    'Action',
    'ngDialog'
  ];

  function PollsTagController(
    $scope,
    $state,
    $window,
    Authentication,
    tag,
    Action,
    dialog
  ) {
    var vm = this;
    vm.tag = tag;

    $scope.busy = false;
    $scope.sort = '-created';
    vm.polls = [];

    get_polls();
    function get_polls() {
      if ($scope.busy) return;
      $scope.busy = true;
      Action.get_tag_polls(vm.tag._id)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            $scope.busy = false;
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
          vm.polls = results || [];
          $scope.busy = false;
        })
        .catch(err => {
          $scope.busy = false;
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
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
        return poll.isCurrentUserOwner;
      }
    };
    $scope.delete_poll = (poll) => {
      if (!poll.isCurrentUserOwner) {
        $scope.handleShowMessage('MS_CM_AUTH_ERROR', true);
        return;
      }
      $scope.message = {};
      $scope.message.content = 'LB_POLLS_CONFIRM_DELETE';
      $scope.message.type = 3;
      $scope.message.button = 'LB_DELETE';
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
        vm.polls = _.without(vm.polls, poll);
        Action.delete_poll(poll);
      }
    };
    $scope.report_poll = (poll) => {
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
      Action.save_bookmark(poll._id)
        .then(res => {
          poll.bookmarked = (res) ? true : false;
          $scope.handleShowMessageWithParam('MS_CM_BOOKMARK_SUCCESS', { title: poll.title }, false);
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    };
    $scope.follow_poll = (poll) => {
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
}());
