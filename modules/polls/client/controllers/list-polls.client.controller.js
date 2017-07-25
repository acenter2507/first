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
    'toasty',
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
    toasty,
    toast,
    dialog,
    Storages,
    Constants,
    UserApi
  ) {
    var vm = this;
    vm.authentication = Authentication;
    vm.isLogged = vm.authentication.user ? true : false;
    vm.polls = [];
    vm.hot_polls = [];
    vm.activitys = JSON.parse(Storages.get_session(Constants.storages.activitys, JSON.stringify([])));
    vm.categorys = [];
    vm.bookmarks = [];
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
      loadCategorys();
      // Load các polls có lượng like nhiều nhất
      loadHotPolls();
      // Load danh sách poll đã bookmark
      if (vm.isLogged) {
        loadBookmarks();
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
          console.log(res);
          // Load options và tính vote cho các opt trong polls
          vm.new_data = res.data || [];

        //   var promises = [];
        //   vm.new_data.forEach(poll => {
        //     poll.isCurrentUserOwner = vm.isLogged && vm.authentication.user._id === poll.user._id;
        //     promises.push(get_poll_report(poll));
        //     promises.push(get_opts(poll));
        //     promises.push(get_owner_follow(poll));
        //     promises.push(get_reported(poll));
        //     promises.push(get_bookmarked(poll));
        //   });
        //   return Promise.all(promises);
        // })
        // .then(res => {
          // Gán data vào list hiện tại
          vm.polls = _.union(vm.polls, vm.new_data);
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
    // Changed
    function get_poll_report(poll) {
      return new Promise((resolve, reject) => {
        Action.get_poll_report(poll._id)
          .then(res => {
            poll.report = res.data;
            return resolve(res);
          })
          .catch(err => {
            return reject(err);
          });
      });
    }
    // Changed
    function get_opts(poll) {
      return new Promise((resolve, reject) => {
        Action.get_opts(poll._id)
          .then(res => {
            poll.opts = _.where(res.data, { status: 1 }) || [];
            return get_vote_for_poll(poll);
          })
          .then(res => {
            return resolve(poll);
          })
          .catch(err => {
            return reject(err);
          });
      });
    }
    // Changed
    function get_vote_for_poll(poll) {
      return new Promise((resolve, reject) => {
        Action.get_voteopts(poll._id)
          .then(res => {
            poll.chart = {
              options: { responsive: true },
              colors: [],
              labels: [],
              data: []
            };
            poll.votes = res.data.votes || [];
            poll.voteopts = res.data.voteopts || [];
            poll.total = poll.voteopts.length;
            poll.opts.forEach(opt => {
              opt.voteCnt = _.where(poll.voteopts, { opt: opt._id }).length || 0;
              opt.progressVal = calPercen(poll.total, opt.voteCnt);
              poll.chart.data.push(opt.voteCnt);
              poll.chart.colors.push(opt.color);
              poll.chart.labels.push(opt.title);
            });
            return resolve(poll);
          })
          .catch(err => {
            return reject(err);
          });
      });
    }

    function loadHotPolls() {
      Action.get_hot_polls(0)
        .then(res => {
          vm.hot_polls = res.data || [];
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    }
    function loadCategorys() {
      Action.get_categorys()
        .then(res => {
          vm.categorys = res;
          vm.categorys.forEach(category => {
            Action.count_poll_for_category(category._id)
              .then(res => {
                category.count = res.data || 0;
              })
              .catch(err => {
                toast.error(err.message, 'Error!');
              });
          });
        });
    }
    function loadBookmarks() {
      UserApi.get_bookmarks(vm.authentication.user._id, 0)
        .success(res => {
          vm.bookmarks = _.pluck(res, 'poll');
        })
        .error(err => {
          toast.error(err.message, 'Error!');
        });
    }
    // Changed
    function get_owner_follow(poll) {
      return new Promise((resolve, reject) => {
        if (!vm.isLogged) {
          poll.follow = {};
          return resolve();
        }
        Action.get_follow(poll._id)
          .then(res => {
            poll.follow = res.data || { poll: poll._id };
            return resolve(res.data);
          })
          .catch(err => {
            return reject(err);
          });
      });
    }
    // Changed
    function get_reported(poll) {
      return new Promise((resolve, reject) => {
        if (!vm.isLogged) {
          poll.reported = false;
          return resolve();
        }
        Action.get_report(poll._id)
          .then(res => {
            poll.reported = (res.data) ? res.data : false;
            return resolve(res.data);
          })
          .catch(err => {
            return reject(err);
          });
      });
    }
    // Changed
    function get_bookmarked(poll) {
      return new Promise((resolve, reject) => {
        if (!vm.isLogged) {
          poll.bookmarked = false;
          return resolve();
        }
        Action.get_bookmark(poll._id)
          .then(res => {
            poll.bookmarked = (res.data) ? res.data : false;
            return resolve(res.data);
          })
          .catch(err => {
            return reject(err);
          });
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
    vm.delete_poll = (poll) => {
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
    vm.report_poll = (poll) => {
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
    vm.bookmark_poll = (poll) => {
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
    vm.follow_poll = (poll) => {
      if (!vm.isLogged) {
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
    vm.load_new = () => {
      $state.reload();
    };
  }
})();
