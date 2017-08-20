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
    'Authentication',
    'categoryResolve',
    'Action',
    'toastr',
    'ngDialog'
  ];

  function CategoryPollsController(
    $scope,
    $state,
    $window,
    Authentication,
    category,
    Action,
    toast,
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
          toast.error(err.message, 'Error!');
        });
    }

    function process_before_show(poll) {
      return new Promise((resolve, reject) => {
        poll = Action.process_before_show(poll);
        return resolve(poll);
      });
    }
    // Tính phần trăm tỉ lệ vote cho opt
    function calPercen(total, value) {
      if (total === 0) {
        return 0;
      }
      return Math.floor(value * 100 / total) || 0;
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
        vm.polls = _.without(vm.polls, poll);
        Action.delete_poll(poll);
      }
    };
    $scope.report_poll = (poll) => {
      if (poll.reported) {
        toast.error('You are already report this poll.', 'Error!');
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
            toast.success('You have successfully reported this poll.', 'Thank you!');
          })
          .catch(err => {
            toast.error(err.message, 'Error!');
          });
      }
    };
    $scope.bookmark_poll = (poll) => {
      if (poll.bookmarked) {
        toast.error('You are already bookmark this poll.', 'Error!');
        return;
      }
      Action.save_bookmark(poll._id)
        .then(res => {
          poll.bookmarked = (res) ? true : false;
          toast.success('Added to bookmarks.', 'Success!');
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    };
    $scope.follow_poll = (poll) => {
      if (!$scope.isLogged) {
        toast.error('You must login to follow this poll.', 'Error!');
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
}());
