(function () {
  'use strict';
  angular
    .module('polls')
    .controller('PollsListController', PollsListController);

  PollsListController.$inject = [
    '$scope',
    '$window',
    'Socket',
    'Authentication',
    'Action',
    'toasty',
    'toastr'
  ];

  function PollsListController(
    $scope,
    $window,
    Socket,
    Authentication,
    Action,
    toasty,
    toast
  ) {
    var vm = this;
    vm.authentication = Authentication;
    vm.isLogged = vm.authentication.user ? true : false;
    vm.polls = [];
    vm.hot_polls = [];
    vm.categorys = [];
    vm.new_data = [];
    vm.page = 0;
    vm.busy = false;
    vm.stopped = false;
    vm.get_polls = get_polls;
    vm.new_polls = [];
    init();

    function init() {
      initSocket();
      loadCategorys();
      // load Hot poll
      loadHotPolls();
    }

    function initSocket() {
      if (!Socket.socket) {
        Socket.connect();
      }
      Socket.emit('subscribe_public');
      Socket.on('poll_create', pollId => {
        vm.new_polls.push(pollId);
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
          var promises = [];
          vm.new_data.forEach(poll => {
            poll.isCurrentUserOwner = vm.isLogged && vm.authentication.user._id === poll.user._id;
            promises.push(get_poll_report(poll));
            promises.push(get_opts(poll));
            promises.push(get_owner_follow(poll));
            promises.push(get_reported(poll));
            promises.push(get_bookmarked(poll));
          });
          return Promise.all(promises);
        })
        .then(res => {
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
        });
    }
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
    function socketHandlePollCreate(res) {
      vm.new_polls
    }
    // Thao tác khác
    vm.delete_poll = (poll) => {
      if (!poll.isCurrentUserOwner) {
        toast.error('You are not authorized.', 'Error!');
        return;
      }
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.polls = _.without(vm.polls, poll);
        Action.delete_poll(poll);
      }
    };
    vm.report_poll = (poll) => {
      if (poll.reported) {
        toast.error('You are already report this poll.', 'Error!');
        return;
      }
      Action.save_report(poll._id)
        .then(res => {
          poll.reported = (res) ? true : false;
          $scope.$apply();
          toast.success('You have successfully reported this poll.', 'Thank you!');
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    };
    vm.bookmark_poll = (poll) => {
      if (poll.bookmarked) {
        toast.error('You are already bookmark this poll.', 'Error!');
        return;
      }
      Action.save_bookmark(poll._id)
        .then(res => {
          poll.bookmarked = (res) ? true : false;
          $scope.$apply();
          toast.success('Added to bookmarks.', 'Success!');
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    };
    vm.follow_poll = (poll) => {
      if (!vm.isLogged) {
        toast.error('You must login to follow this poll.', 'Error!');
        return;
      }
      Action.save_follow(poll.follow)
        .then(res => {
          poll.follow = res;
          $scope.$apply();
          toast.success('You followed this poll.', 'Success!');
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    };
    vm.reload = () => {
      var tmp_list = _.clone(vm.new_polls);
      vm.new_polls = [];
      angular.forEach(vm.tmp_list, (item, index) => {
        Action.get_poll_http(item)
          .then(_poll => {
            _poll.isCurrentUserOwner = vm.isLogged && vm.authentication.user._id === _poll.user._id;
            promises.push(get_poll_report(_poll));
            promises.push(get_opts(_poll));
            promises.push(get_owner_follow(_poll));
            promises.push(get_reported(_poll));
            promises.push(get_bookmarked(_poll));
            return Promise.all(promises);
          })
          .then(poll => {
            vm.polls.push(poll);
          })
          .catch(err => {
            toast.error(err.message, 'Error!');
          });
      });
    };
    vm.themes = [{
      name: 'Default Theme',
      code: 'default'
    }, {
      name: 'Material Design',
      code: 'material'
    }, {
      name: 'Bootstrap 3',
      code: 'bootstrap'
    }];
    vm.toastyTypes = [{
      name: 'Default',
      code: 'default',
    }, {
      name: 'Info',
      code: 'info'
    }, {
      name: 'Success',
      code: 'success'
    }, {
      name: 'Wait',
      code: 'wait'
    }, {
      name: 'Error',
      code: 'error'
    }, {
      name: 'Warning',
      code: 'warning'
    }];
    vm.toastyOpts = {
      title: 'Toast It!',
      msg: 'Mmmm, tasties...',
      showClose: false,
      clickToClose: true,
      timeout: 5000,
      sound: true,
      html: false,
      shake: false,
      theme: vm.themes[1].code,
      type: vm.toastyTypes[0].code
    };
    vm.show_toasty = () => {
      toasty[vm.toastyOpts.type]({
        title: vm.toastyOpts.title,
        msg: vm.toastyOpts.msg,
        showClose: vm.toastyOpts.showClose,
        clickToClose: vm.toastyOpts.clickToClose,
        sound: vm.toastyOpts.sound,
        shake: vm.toastyOpts.shake,
        timeout: vm.toastyOpts.timeout || false,
        html: vm.toastyOpts.html,
        theme: vm.toastyOpts.theme
      });
    };
    vm.show_toastr = () => {
      toast.success('Hello world!', 'Toastr fun!');
      toast.error('Hello world!', 'Toastr fun!');
      toast.info('Hello world!', 'Toastr fun!');
      toast.wait('Hello world!', 'Toastr fun!');
    };
  }
})();
