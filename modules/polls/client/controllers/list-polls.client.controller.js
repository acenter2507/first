(function () {
  'use strict';
  angular
    .module('polls')
    .controller('PollsListController', PollsListController);

  PollsListController.$inject = [
    '$state',
    '$scope',
    '$window',
    'Socket',
    'Authentication',
    'Action',
    'toastr',
    'ngDialog',
    'Storages',
    'Constants',
    'UserApi'
  ];

  function PollsListController(
    $state,
    $scope,
    $window,
    Socket,
    Authentication,
    Action,
    toast,
    dialog,
    Storages,
    Constants,
    UserApi
  ) {
    var vm = this;
    $scope.user = Authentication.user;
    $scope.isLogged = ($scope.user);

    vm.polls = [];
    vm.hot_polls = [];
    vm.activitys = JSON.parse(Storages.get_session(Constants.storages.activitys, JSON.stringify([])));
    vm.categorys = [];
    vm.bookmarks = [];
    vm.tags = [];
    vm.new_data = [];
    vm.page = 0;
    vm.busy = false;
    vm.stopped = false;
    vm.get_polls = get_polls;
    vm.is_has_new_polls = false;
    init();

    function init() {
      initSocket();
      // Load danh sách category (Bao gồm số poll)
      get_categorys();
      // Load danh sách tags (Bao gồm số poll)
      get_popular_tags();
      // Load các polls có lượng like nhiều nhất
      get_hot_polls();
      // Load danh sách poll đã bookmark
      if ($scope.isLogged) {
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
      Socket.on('activity', res => {
        vm.activitys.push(res);
        Storages.set_session(Constants.storages.activitys, JSON.stringify(vm.activitys));
      });
      $scope.$on('$destroy', function () {
        Socket.emit('unsubscribe_public');
        Socket.removeListener('poll_create');
      });
    }

    function get_polls() {
      if (vm.stopped || vm.busy) return;
      vm.busy = true;
      Action.get_polls(vm.page)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            vm.stopped = true;
            vm.busy = false;
            return;
          }
          // Load options và tính vote cho các opt trong polls
          vm.new_data = res.data || [];
          // Xử lý poll trước khi hiển thị màn hình
          var promises = [];
          vm.new_data.forEach(poll => {
            promises.push(process_before_show(poll));
          });
          return Promise.all(promises);
        })
        .then(results => {
          // Gán data vào list hiện tại
          vm.polls = _.union(vm.polls, results);
          vm.page += 1;
          vm.busy = false;
          $scope.$apply();
          vm.new_data = [];
        })
        .catch(err => {
          vm.busy = false;
          vm.stopped = true;
          toast.error(err.message, 'Error!');
        });
    }
    function process_before_show(poll) {
      return new Promise((resolve, reject) => {
        poll.isCurrentUserOwner = $scope.isLogged && scope.user._id === poll.user._id;
        poll.chart = {
          options: { responsive: true },
          colors: [],
          labels: [],
          data: []
        };
        poll.total = poll.voteopts.length;
        poll.opts.forEach(opt => {
          opt.voteCnt = _.where(poll.voteopts, { opt: opt._id }).length || 0;
          opt.progressVal = calPercen(poll.total, opt.voteCnt);
          poll.chart.data.push(opt.voteCnt);
          poll.chart.colors.push(opt.color);
          poll.chart.labels.push(opt.title);
        });
        return resolve(poll);
      });
    }
    function get_hot_polls() {
      Action.get_hot_polls(0)
        .then(res => {
          vm.hot_polls = res.data || [];
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    }
    function get_categorys() {
      Action.get_categorys()
        .then(res => {
          vm.categorys = res;
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
      UserApi.get_bookmarks(scope.user._id, 0)
        .then(res => {
          vm.bookmarks = res.data || [];
        }, err => {
          toast.error(err.message, 'Error!');
        });
    }
    // Tính phần trăm tỉ lệ vote cho opt
    function calPercen(total, value) {
      if (total === 0) {
        return 0;
      }
      return Math.floor(value * 100 / total) || 0;
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
            $scope.$apply();
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
          $scope.$apply();
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
          poll.follow = res;
          $scope.$apply();
          if (poll.follow.following) {
            toast.success('You followed ' + poll.title, 'Success!');
          }
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    };
    $scope.load_new = () => {
      $state.reload();
    };
  }
})();
