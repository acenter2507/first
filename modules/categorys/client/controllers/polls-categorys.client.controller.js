(function () {
  'use strict';

  // Categorys controller
  angular
    .module('categorys')
    .controller('CategoryPollsController', CategoryPollsController);

  CategoryPollsController.$inject = [
    '$scope',
    '$state',
    '$window',
    'categoryResolve',
    'Action',
    'ngDialog'
  ];

  function CategoryPollsController(
    $scope,
    $state,
    $window,
    category,
    Action,
    dialog
  ) {
    var vm = this;
    vm.category = category;

    // Infinity scroll
    $scope.stopped = false;
    $scope.busy = false;
    $scope.page = 0;
    $scope.sort = '-created';
    $scope.new_data = [];
    vm.polls = [];

    vm.get_polls = get_polls;
    function get_polls() {
      if ($scope.stopped || $scope.busy) return;
      $scope.busy = true;
      Action.get_category_polls(vm.category._id, $scope.page, $scope.sort)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            $scope.stopped = true;
            $scope.busy = false;
            return;
          }
          // Load options và tính vote cho các opt trong polls
          $scope.new_data = res.data || [];
          var promises = [];
          $scope.new_data.forEach(poll => {
            promises.push(process_before_show(poll));
          });
          return Promise.all(promises);
        })
        .then(results => {
          // Gán data vào list hiện tại
          results = results || [];
          vm.polls = _.union(vm.polls, results);
          $scope.page += 1;
          $scope.busy = false;
          $scope.new_data = [];
        })
        .catch(err => {
          $scope.busy = false;
          $scope.stopped = true;
          $scope.handleShowMessage(err.message, true);
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
      // Gọi function show dialog từ scope cha
      $scope.handleShowConfirm({
        content: 'LB_POLLS_CONFIRM_DELETE',
        type: 3,
        button: 'LB_DELETE'
      }, confirm => {
        vm.polls = _.without(vm.polls, poll);
        Action.delete_poll(poll);
      }, false);
      // $scope.message = {};
      // $scope.message.content = 'LB_POLLS_CONFIRM_DELETE';
      // $scope.message.type = 3;
      // $scope.message.button = 'LB_DELETE';
      // dialog.openConfirm({
      //   scope: $scope,
      //   templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
      // }).then(confirm => {
      //   handle_delete();
      // }, reject => {
      // });
      // function handle_delete() {
      //   vm.polls = _.without(vm.polls, poll);
      //   Action.delete_poll(poll);
      // }
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
            $scope.handleShowMessage(err.message, true);
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
          $scope.handleShowMessage(err.message, true);
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
          $scope.handleShowMessage(err.message, true);
        });
    };
  }
}());
