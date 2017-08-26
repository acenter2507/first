(function () {
  'use strict';
  angular
    .module('polls')
    .controller('PollsListController', PollsListController);

  PollsListController.$inject = [
    '$rootScope',
    '$state',
    '$scope',
    '$window',
    'Socket',
    'Action',
    'toastr',
    'ngDialog',
    'Storages',
    'Constants',
    'UserApi'
  ];

  function PollsListController(
    $rootScope,
    $state,
    $scope,
    $window,
    Socket,
    Action,
    toast,
    dialog,
    Storages,
    Constants,
    UserApi
  ) {
    var vm = this;

    vm.polls = [];
    vm.hot_polls = [];
    vm.bookmarks = [];
    vm.tags = [];
    vm.new_data = [];
    vm.page = 0;
    vm.busy = false;
    vm.stopped = false;
    vm.is_has_new_polls = false;
    init();

    function init() {
      // Lắng nghe sự liện từ socket
      initSocket();
      // Load danh sách tags (Bao gồm số poll)
      get_popular_tags();
      // Load các polls có lượng like nhiều nhất
      get_populars();
      // Load danh sách poll đã bookmark
      if ($scope.isLogged) {
        // Lắng nghe sự kiện từ rootScope;
        get_bookmarks();
      }
    }

    function initSocket() {
      if (!Socket.socket) {
        Socket.connect();
      }
      Socket.emit('subscribe_public');
      Socket.on('poll_create', () => {
        vm.is_has_new_polls = true;
      });
      $scope.$on('$destroy', function () {
        Socket.emit('unsubscribe_public');
        Socket.removeListener('poll_create');
      });
    }

    vm.get_polls = get_polls;
    function get_polls() {
      if (vm.stopped || vm.busy) return;
      vm.busy = true;
      if (Storages.has_session(Constants.storages.polls)) {

      }
      Action.get_polls(vm.page)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            vm.stopped = true;
            vm.busy = false;
            return;
          }
          // Xử lý poll trước khi hiển thị màn hình
          var promises = [];
          res.data.forEach(poll => {
            promises.push(process_before_show(poll));
          });
          return Promise.all(promises);
        })
        .then(results => {
          // Gán data vào list hiện tại
          results = results || [];
          vm.polls = _.union(vm.polls, results);
          vm.page += 1;
          vm.busy = false;
          $scope.$apply();
        })
        .catch(err => {
          vm.busy = false;
          vm.stopped = true;
          toast.error(err.message, 'Error!');
        });
    }
    function process_before_show(poll) {
      return new Promise((resolve, reject) => {
        poll = Action.process_before_show(poll);
        return resolve(poll);
      });
    }
    function get_populars() {
      Action.get_populars(0)
        .then(res => {
          console.log(res.data);
          vm.populars = res.data;
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    }
    function get_popular_tags() {
      Action.get_popular_tags()
        .then(res => {
          vm.tags = res.data;
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    }
    function get_bookmarks() {
      UserApi.get_bookmarks($scope.user._id, 0)
        .then(res => {
          vm.bookmarks = res.data || [];
        }, err => {
          toast.error(err.message, 'Error!');
        });
    }

    // Thao tác khác
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
      Action.save_bookmark(poll._id)
        .then(res => {
          poll.bookmarked = (res) ? true : false;
          toast.success('Added ' + poll.title + ' to bookmarks.', 'Success!');
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    };
    $scope.follow_poll = (poll) => {
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
    $scope.load_new = () => {
      $state.reload();
    };

    // Quick menu
    $scope.isOpen = false;
    $scope.q_quick_poll = () => {
      if (!$scope.isLogged) {
        $state.go('authentication.signin');
        return;
      }
      var q_quick_poll = dialog.open({
        template: '<quick-poll></quick-poll>',
        plain: true,
        controller: 'QuickPollController',
        controllerAs: 'ctrl',
        appendClassName: 'images-upload-dialog',
        closeByDocument: false
      });
    };
    $scope.q_post_poll = () => {
      $state.go('polls.create');
    };
    $scope.q_search = () => {
      $state.go('search');
    };
  }
})();
