(function () {
  'use strict';
  // Polls controller
  angular.module('polls').controller('PollsController', PollsController);

  PollsController.$inject = [
    '$scope',
    '$state',
    '$window',
    'Authentication',
    'pollResolve',
    'Socket',
    '$bsModal',
    '$bsAside',
    '$timeout',
    'Remaining',
    'Action',
    'toastr',
    'ngDialog'
  ];

  function PollsController(
    $scope,
    $state,
    $window,
    Authentication,
    poll,
    Socket,
    $bsModal,
    $bsAside,
    $timeout,
    Remaining,
    Action,
    toast,
    dialog
  ) {
    var vm = this;
    vm.authentication = Authentication;
    vm.isLogged = vm.authentication.user ? true : false;

    vm.poll = poll;
    vm.form = {};

    // Options variable
    vm.opts = [];
    vm.tmp_opt = {};
    vm.opt_aside = {};
    vm.votedOpts = [];
    vm.selectedOpts = [];

    vm.cmt_sorts = [
      { val: '-created', name: 'Newest to oldest' },
      { val: 'created', name: 'Oldest to newest' },
      { val: '-likeCnt', name: 'Most likes' }
    ];
    vm.cmt_sort = vm.cmt_sorts[0];
    // Biến tự động gửi khi enter
    vm.enter_send = true;
    // Người dùng đã report poll hiện tại
    vm.reported = false;
    // Người dùng đã bookmark poll hiện tại
    vm.bookmarked = false;
    vm.votes = [];
    vm.voteopts = [];
    vm.votedTotal = 0;

    // Infinity scroll
    vm.cmts = [];
    vm.new_cmts = [];
    vm.page = 0;
    vm.busy = false;
    vm.stopped = false;

    vm.cmt_processing = false;
    vm.cmt_typing = false;
    vm.like_processing = false;
    vm.tmp_cmt = {};
    vm.optionToggle = -1;

    vm.close_duration = {};
    vm.remaining = 1;

    init();

    // Init data
    function init() {
      if (!vm.poll._id) {
        $state.go('polls.list');
      }
      get_info_poll();
      get_owner_info();

      if (!vm.isClosed && vm.poll.close) {
        loadRemaining();
      }
      // Init socket
      initSocket();
    }

    // Init Socket
    function initSocket() {
      if (!Socket.socket) {
        Socket.connect();
      }
      Socket.emit('subscribe_poll', {
        pollId: vm.poll._id,
        userId: vm.authentication.user._id
      });
      Socket.on('cmt_add', cmtId => {
        Action.get_cmt(cmtId)
          .then(res => {
            return get_like_cmt(res.data);
          })
          .then(_cmt => {
            var item = _.findWhere(vm.cmts, { _id: _cmt._id });
            if (item) {
              _.extend(_.findWhere(vm.cmts, { _id: _cmt._id }), _cmt);
            } else {
              vm.cmts.push(_cmt);
              vm.poll.report.cmtCnt += 1;
            }
          })
          .catch(err => {
            toast.error(err.message, 'Error!');
          });
      });
      Socket.on('cmt_del', cmtId => {
        vm.cmts = _.without(vm.cmts, _.findWhere(vm.cmts, { _id: cmtId }));
        vm.poll.report.cmtCnt -= 1;
      });
      Socket.on('poll_like', report => {
        // Update poll like
        vm.poll.report = report;
      });
      Socket.on('cmt_like', res => {
        vm.cmts.forEach(cmt => {
          if (cmt._id.toString() === res.cmtId.toString()) {
            cmt.likeCnt = res.likeCnt;
          }
        });
        // $scope.$apply();
      });
      Socket.on('poll_vote', res => {
        Action.get_voteopts(vm.poll._id)
          .then(res => { // lấy thông tin vote
            vm.chart = {
              type: 'pie',
              options: { responsive: true },
              colors: [],
              labels: [],
              data: []
            };
            vm.votes = res.data.votes || [];
            vm.voteopts = res.data.voteopts || [];
            vm.votedTotal = vm.voteopts.length;
            vm.opts.forEach(opt => {
              opt.voteCnt = _.where(vm.voteopts, { opt: opt._id }).length || 0;
              opt.progressVal = calPercen(vm.votedTotal, opt.voteCnt);
              vm.chart.colors.push(opt.color);
              vm.chart.labels.push(opt.title);
              vm.chart.data.push(opt.voteCnt);
            });
            $scope.$apply();
          })
          .catch(err => {
            toast.error(err.message, 'Error!');
          });
      });
      Socket.on('poll_delete', res => {
        alert('This poll has been deleted by owner. Please back to list screen.');
        $state.go('polls.list');
      });
      Socket.on('poll_update', res => {
        Action.get_poll(vm.poll._id)
          .then(_poll => {
            vm.poll = _poll;
            return get_info_poll();
          });
      });
      Socket.on('opts_update', res => {
        Action.get_opts(vm.poll._id)
          .then(res => { // lấy thông tin report
            vm.opts = _.where(res.data, { status: 1 });
            return Action.get_voteopts(vm.poll._id);
          })
          .then(res => { // lấy thông tin vote
            vm.chart = {
              type: 'pie',
              options: { responsive: true },
              colors: [],
              labels: [],
              data: []
            };
            vm.votes = res.data.votes || [];
            vm.voteopts = res.data.voteopts || [];
            vm.votedTotal = vm.voteopts.length;
            vm.opts.forEach(opt => {
              opt.voteCnt = _.where(vm.voteopts, { opt: opt._id }).length || 0;
              opt.progressVal = calPercen(vm.votedTotal, opt.voteCnt);
              vm.chart.colors.push(opt.color);
              vm.chart.labels.push(opt.title);
              vm.chart.data.push(opt.voteCnt);
            });
            $scope.$apply();
          })
          .catch(err => {
            toast.error(err.message, 'Error!');
          });
      });
      $scope.$on('$destroy', function () {
        Socket.emit('unsubscribe_poll', {
          pollId: vm.poll._id,
          userId: vm.authentication.user._id
        });
        Socket.removeListener('cmt_add');
        Socket.removeListener('cmt_del');
        Socket.removeListener('poll_like');
        Socket.removeListener('cmt_like');
        Socket.removeListener('poll_vote');
        Socket.removeListener('poll_delete');
        Socket.removeListener('poll_update');
        Socket.removeListener('opts_update');
      });
    }

    function get_info_poll() {
      return new Promise((resolve, reject) => {
        // Thiết lập các thông tin cho poll
        vm.poll.close = vm.poll.close ? moment(vm.poll.close) : vm.poll.close;
        vm.isClosed = vm.poll.close ? moment(vm.poll.close).isBefore(new moment()) : false;
        vm.poll.tags = [];
        // Lấy thông tin options
        Action.get_opts(vm.poll._id)
          .then(res => { // lấy thông tin report
            vm.opts = _.where(res.data, { status: 1 });
            return Action.get_poll_report(vm.poll._id);
          })
          .then(res => { // lấy thông tin vote
            vm.poll.report = res.data;
            return Action.get_voteopts(vm.poll._id);
          })
          .then(res => { // Lấy tags
            vm.chart = {
              type: 'pie',
              options: { responsive: true },
              colors: [],
              labels: [],
              data: []
            };
            vm.votes = res.data.votes || [];
            vm.voteopts = res.data.voteopts || [];
            vm.votedTotal = vm.voteopts.length;
            vm.opts.forEach(opt => {
              opt.voteCnt = _.where(vm.voteopts, { opt: opt._id }).length || 0;
              opt.progressVal = calPercen(vm.votedTotal, opt.voteCnt);
              vm.chart.colors.push(opt.color);
              vm.chart.labels.push(opt.title);
              vm.chart.data.push(opt.voteCnt);
            });
            return Action.get_tags(vm.poll._id);
          })
          .then(res => { // Update màn hình
            angular.forEach(res.data, (polltag, index) => {
              vm.poll.tags.push(polltag.tag);
            });
            $scope.$apply();
            return resolve();
          })
          .catch(err => {
            toast.error(err.message, 'Error!');
            return reject();
          });
      });
    }
    function get_owner_info() {
      vm.votedOpts = [];
      vm.selectedOpts = [];
      vm.follow = { poll: vm.poll._id };
      vm.reported = false;
      vm.bookmarked = false;
      vm.like = {};
      return new Promise((resolve, reject) => {
        Action.get_vote(vm.poll._id)
          .then(res => { // Get ownVote
            vm.ownVote = res && res.data ? res.data : { poll: vm.poll._id };
            if (vm.ownVote._id) {
              return Action.get_opts_for_vote(vm.ownVote._id);
            } else {
              return next();
            }
          })
          .then(res => { // Get votedOpts
            if (res && res.data) {
              res.data.forEach(voteopt => {
                vm.votedOpts.push(voteopt.opt._id);
                vm.selectedOpts.push(voteopt.opt._id);
              });
            }
            return (vm.isLogged) ? Action.get_follow(vm.poll._id) : next();
          })
          .then(res => { // Get follow
            if (res && res.data) {
              vm.follow = res.data;
            }
            return (vm.isLogged) ? Action.get_report(vm.poll._id) : next();
          })
          .then(res => { // Get reported
            if (res && res.data) {
              vm.reported = res.data;
            }
            return (vm.isLogged) ? Action.get_bookmark(vm.poll._id) : next();
          })
          .then(res => { // Get bookmarked
            if (res && res.data) {
              vm.bookmarked = res.data;
            }
            return (vm.isLogged) ? Action.get_like(vm.poll._id) : next();
          })
          .then(res => { // Get like
            if (res && res.data) {
              vm.like = res.data;
            }
            $scope.$apply();
            return resolve();
          })
          .catch(err => {
            toast.error(err.message, 'Error!');
            return reject();
          });
      });
    }

    function next() {
      return new Promise((resolve, reject) => {
        return resolve();
      });
    }

    function get_like_cmt(cmt) {
      return new Promise((resolve, reject) => {
        if (!vm.isLogged) {
          cmt.like = {};
          return resolve(cmt);
        } else {
          Action.get_like_cmt(cmt._id)
            .then(res => {
              cmt.like = res.data || {};
              return resolve(cmt);
            })
            .catch(err => {
              return reject(err);
            });
        }
      });
    }

    vm.get_cmts = get_cmts;
    function get_cmts() {
      if (vm.stopped || vm.busy) return;
      vm.busy = true;
      Action.get_cmts(vm.poll._id, vm.page)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            vm.stopped = true;
            vm.busy = false;
            return;
          }
          // Lấy data trả về
          vm.new_cmts = res.data || [];
          // Load thông tin like cho các comment mới
          var promises = [];
          vm.new_cmts.forEach(cmt => {
            promises.push(get_like_cmt(cmt));
          });
          return Promise.all(promises);
        })
        .then(res => {
          // Gán data vào danh sách comment hiện tại
          vm.cmts = _.union(vm.cmts, vm.new_cmts);
          vm.page += 1;
          vm.busy = false;
          vm.new_cmts = [];
          $scope.$apply();
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    }

    function loadRemaining() {
      vm.remaining = $timeout(makeRemaining, 1000);
      $scope.$on('$destroy', () => {
        $timeout.cancel(vm.remaining);
      });
    }

    function makeRemaining() {
      vm.close_duration = Remaining.duration(vm.poll.close);
      vm.isClosed = moment(vm.poll.close).isBefore(new moment());
      if (!vm.isClosed) {
        vm.remaining = $timeout(makeRemaining, 1000);
      } else {
        $timeout.cancel(vm.remaining);
      }
    }

    // Thao tác databse
    function save_cmt() {
      if (
        !vm.tmp_cmt.body ||
        !vm.tmp_cmt.body.length ||
        vm.tmp_cmt.body.length === 0
      ) {
        toast.error('You must type something to reply.', 'Error!');
        return;
      }
      if (!vm.isLogged) {
        $state.go('authentication.signin');
        return false;
      }
      if (vm.cmt_processing) {
        toast.error('Please wait until all comment be submit.', 'Error!');
        return;
      }
      vm.cmt_processing = true;
      Action.save_cmt(vm.poll._id, vm.tmp_cmt)
        .then(res => {
          vm.tmp_cmt = {};
          vm.cmt_processing = false;
          vm.cmt_typing = false;
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
          vm.cmt_processing = false;
        });
    }

    function save_vote() {
      if (!vm.authentication.user && !vm.poll.allow_guest) {
        return $state.go('authentication.signin');
      }
      if (!vm.selectedOpts.length || vm.selectedOpts.length === 0) {
        toast.error('You must vote at least one option.', 'Error!');
        return;
      }
      Action.save_vote(vm.ownVote, vm.selectedOpts)
        .then(res => {
          vm.ownVote = res;
          $scope.$apply();
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
          vm.selectedOpts = angular.copy(vm.votedOpts) || [];
        });
    }

    // Tính phần trăm tỉ lệ vote cho opt
    function calPercen(total, value) {
      if (total === 0) {
        return 0;
      }
      return Math.floor(value * 100 / total) || 0;
    }

    // Remove existing Poll
    vm.remove = () => {
      dialog.openConfirm({
        scope: $scope,
        template:
        '<div class="ngdialog-message">' +
        '  <h2 class="confirmation-title"><i class="fa fa-exclamation-triangle orange"></i> Are you sure?</h2>' +
        '  <span>Are you sure you want to delete?</span>' +
        '    <div class="ngdialog-buttons">' +
        '      <button type="button" class="ngdialog-button" ng-click="confirm(confirmValue)">Delete</button>' +
        '      <button type="button" class="ngdialog-button" ng-click="closeThisDialog()">Cancel</button>' +
        '    </div>' +
        '</div>',
      }).then(function (confirm) {
        alert('Confirmed');
      }, function (reject) {
        alert('Rejected');
      });
      // if ($window.confirm('Are you sure you want to delete?')) {
      //   vm.poll.$remove(() => {
      //     Socket.emit('poll_delete', { pollId: vm.poll._id });
      //     $state.go('polls.list');
      //   });
      // }
    };

    vm.like_poll = type => {
      if (!vm.isLogged) {
        toast.error('You must login to like this poll.', 'Error!');
        return;
      }
      if (vm.poll.isCurrentUserOwner) {
        toast.error('You cannot like your poll.', 'Error!');
        return;
      }
      if (vm.like_processing) {
        toast.error('You cannot interact continuously.', 'Error!');
        return;
      }
      vm.like_processing = true;
      Action.save_like(vm.like, type, vm.poll)
        .then(res => {
          vm.poll.likeCnt = res.likeCnt;
          vm.like = res.like;
          vm.like_processing = false;
          $scope.$apply();
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
          vm.like_processing = false;
        });
    };

    vm.follow_poll = () => {
      if (!vm.isLogged) {
        toast.error('You must login to follow this poll.', 'Error!');
        return;
      }
      Action.save_follow(vm.follow)
        .then(res => {
          vm.follow = res;
          $scope.$apply();
          if (res.following) {
            toast.success('You have following this poll.', 'Thank you!');
          }
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    };

    vm.report_poll = () => {
      if (vm.reported) {
        toast.error('You are already report this poll.', 'Error!');
        return;
      }
      Action.save_report(vm.poll._id)
        .then(res => {
          vm.reported = (res) ? true : false;
          $scope.$apply();
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    };

    vm.bookmark_poll = () => {
      if (vm.bookmarked) {
        toast.error('You are already bookmark this poll.', 'Error!');
        return;
      }
      Action.save_bookmark(vm.poll._id)
        .then(res => {
          vm.bookmarked = (res) ? true : false;
          $scope.$apply();
          toast.success('Added to bookmarks.', 'Success!');
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    };
    // OPTIONS
    vm.opt_aside = $bsAside({
      scope: $scope,
      controllerAs: vm,
      templateUrl: 'modules/polls/client/views/new-opt.client.view.html',
      title: 'Suggest new option',
      placement: 'bottom',
      animation: 'am-fade-and-slide-bottom',
      show: false
    });

    // Click button add option
    vm.input_opt = opt => {
      vm.tmp_opt = (!opt) ? { poll: vm.poll._id, title: '', body: '', status: 2 } : opt;
      vm.opt_aside.$promise.then(vm.opt_aside.show);
    };
    // Click button save option
    vm.save_opt = isValid => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.optForm');
        return false;
      }
      Action.save_opt(vm.tmp_opt)
        .then(res => {
          vm.opt_aside.$promise.then(vm.opt_aside.hide);
          toast.success('Your option is waiting for approve.', 'Thank you!');
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    };

    vm.save_cmt = save_cmt;
    vm.reply_cmt = cmt => {
      if (!vm.isLogged) {
        toast.error('You must login to reply this comment.', 'Error!');
        return;
      }
      vm.tmp_cmt = {};
      vm.tmp_cmt.to = cmt.user._id;
      vm.tmp_cmt.toName = cmt.user.displayName;
      vm.tmp_cmt.discard = true;
      vm.cmt_typing = true;
    };

    vm.edit_cmt = cmt => {
      vm.tmp_cmt = _.clone(cmt);
      vm.tmp_cmt.discard = true;
      vm.cmt_typing = true;
    };

    vm.discard_cmt = () => {
      vm.tmp_cmt = {};
      vm.cmt_typing = false;
    };

    vm.delete_cmt = cmt => {
      if (confirm('Do you want to delete this comment ?')) {
        Action.delete_cmt(cmt);
      }
    };
    var cnt = 0;
    vm.focus_cmt = () => {
      if (!vm.isLogged) {
        toast.error('You must login to comment.', 'Error!');
        return;
      }
      vm.cmt_typing = true;
    };

    vm.like_cmt = (cmt, type) => {
      if (!vm.isLogged) {
        toast.error('You must login to like this comment.', 'Error!');
        return;
      }
      if (vm.authentication.user._id === cmt.user._id) {
        toast.error('You cannot like your comment.', 'Error!');
        return;
      }
      if (vm.like_processing) {
        toast.error('You cannot interact continuously.', 'Error!');
        return;
      }
      vm.like_processing = true;
      Action.save_like_cmt(cmt, type)
        .then(res => {
          cmt.like = res.like;
          cmt.likeCnt = res.likeCnt;
          vm.like_processing = false;
        })
        .catch(err => {
          vm.like_processing = false;
          toast.error(err.message, 'Error!');
        });
    };

    // VOTE
    vm.checked = function (id) {
      if (vm.poll.allow_multiple) {
        if (_.contains(vm.selectedOpts, id)) {
          vm.selectedOpts = _.without(vm.selectedOpts, id);
        } else {
          vm.selectedOpts.push(id);
        }
      } else {
        if (!_.contains(vm.selectedOpts, id)) {
          vm.selectedOpts = [id];
        }
      }
    };
    vm.is_can_vote = () => {
      if (vm.poll.allow_guest) {
        return true;
      } else {
        return vm.isLogged;
      }
    };
    vm.is_voted = function (id) {
      return _.contains(vm.selectedOpts, id);
    };
    vm.is_voted_all = () => {
      return vm.selectedOpts.length === vm.opts.length;
    };
    vm.toggleAll = () => {
      if (vm.selectedOpts.length === vm.opts.length) {
        vm.selectedOpts = [];
      } else if (vm.selectedOpts.length === 0 || vm.selectedOpts.length > 0) {
        vm.selectedOpts = _.pluck(vm.opts, '_id');
      }
    };
    vm.isIndeterminate = () => {
      return (vm.selectedOpts.length !== 0 && vm.selectedOpts.length !== vm.opts.length);
    };
    vm.save_vote = save_vote;
    vm.toggle_chart = () => {
      vm.chart.type = vm.chart.type === 'polarArea' ?
        'pie' : 'polarArea';
    };

    vm.show_dialog = () => {
      dialog.open({ template: 'templateId' });
    };
  }
})();
