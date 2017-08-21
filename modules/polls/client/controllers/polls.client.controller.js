(function () {
  'use strict';
  // Polls controller
  angular.module('polls').controller('PollsController', PollsController);

  PollsController.$inject = [
    '$location',
    '$rootScope',
    '$scope',
    '$state',
    '$window',
    'Socket',
    '$timeout',
    'Remaining',
    'Action',
    'toastr',
    'ngDialog',
    '$stateParams',
    'Socialshare',
    'Notification',
    'NotifsService'
  ];

  function PollsController(
    $location,
    $rootScope,
    $scope,
    $state,
    $window,
    Socket,
    $timeout,
    Remaining,
    Action,
    toast,
    dialog,
    $stateParams,
    Socialshare,
    Notification,
    NotifsService
  ) {
    var ctrl = this;
    ctrl.form = {};
    // Options variable
    ctrl.opts = [];
    ctrl.tmp_opt = {};
    ctrl.votedOpts = [];
    ctrl.selectedOpts = [];

    // Sắp xếp comments
    ctrl.cmt_sorts = [
      { val: '-created', name: 'Newest to oldest' },
      { val: 'created', name: 'Oldest to newest' },
      { val: '-likeCnt', name: 'Most likes' }
    ];
    ctrl.cmt_sort = ctrl.cmt_sorts[0];
    // Biến tự động gửi khi enter
    ctrl.enter_send = true;
    // Người dùng đã report poll hiện tại
    ctrl.reported = false;
    // Người dùng đã bookmark poll hiện tại
    ctrl.bookmarked = false;
    ctrl.votes = [];
    ctrl.voteopts = [];
    ctrl.votedTotal = 0;

    // Infinity scroll
    ctrl.cmts = [];
    ctrl.page = 0;
    ctrl.busy = false;
    ctrl.stopped = false;

    ctrl.cmt_processing = false;
    ctrl.cmt_typing = false;
    ctrl.like_processing = false;
    ctrl.tmp_cmt = {};
    ctrl.optionToggle = -1;

    ctrl.close_duration = {};
    ctrl.remaining = 1;
    ctrl.isShow = true;

    analysic_poll();

    // Get poll from param
    function analysic_poll() {
      if (!$stateParams.pollId) {
        $state.go('polls.list');
      } else {
        Action.get_poll($stateParams.pollId)
          .then(_poll => {
            ctrl.poll = _poll;
            init();
          });
      }
    }
    // Init data
    function init() {
      if (!ctrl.poll._id) {
        $state.go('polls.list');
      }
      // Verify parameters
      if (!ctrl.poll.isCurrentUserOwner && !ctrl.poll.isPublic && $stateParams.share !== ctrl.poll.share_code) {
        ctrl.isShow = false;
        toast.error('You cannot view private poll', 'Error!');
        $state.go('polls.list');
      }
      ctrl.isShow = true;
      process_before_show();
      save_viewed();
      get_owner_info();

      if (!ctrl.isClosed && ctrl.poll.close) {
        loadRemaining();
      }
      // Init socket
      initSocket();
      analysic_nofif();
      get_cmts();
    }
    function analysic_nofif() {
      if ($stateParams.notif) {
        Notification.markReadNotif($stateParams.notif);
      }
    }
    // Init Socket
    function initSocket() {
      if (!Socket.socket) {
        Socket.connect();
      }
      Socket.emit('subscribe_poll', {
        pollId: ctrl.poll._id,
        userId: $scope.user._id
      });
      Socket.on('cmt_add', obj => {
        Action.get_cmt(obj.cmtId)
          .then(res => {
            var _cmt = res.data || {};

            var item = _.findWhere(ctrl.cmts, { _id: _cmt._id });
            if (item) {
              _.extend(_.findWhere(ctrl.cmts, { _id: _cmt._id }), _cmt);
            } else {
              if (obj.isNew) {
                ctrl.cmts.push(_cmt);
                ctrl.poll.cmtCnt += 1;
              }
            }
          })
          .catch(err => {
            toast.error(err.message, 'Error!');
          });
      });
      Socket.on('cmt_del', cmtId => {
        ctrl.cmts = _.without(ctrl.cmts, _.findWhere(ctrl.cmts, { _id: cmtId }));
        ctrl.poll.cmtCnt -= 1;
      });
      Socket.on('poll_like', likeCnt => {
        ctrl.poll.likeCnt = likeCnt;
      });
      Socket.on('cmt_like', res => {
        ctrl.cmts.forEach(cmt => {
          if (cmt._id.toString() === res.cmtId.toString()) {
            cmt.likeCnt = res.likeCnt;
          }
        });
      });
      Socket.on('poll_vote', res => {
        Action.get_voteopts(ctrl.poll._id)
          .then(res => { // lấy thông tin vote
            ctrl.chart = {
              type: 'pie',
              options: { responsive: true },
              colors: [],
              labels: [],
              data: []
            };
            ctrl.votes = res.data.votes || [];
            ctrl.voteopts = res.data.voteopts || [];
            ctrl.votedTotal = ctrl.voteopts.length;
            ctrl.opts.forEach(opt => {
              opt.voteCnt = _.where(ctrl.voteopts, { opt: opt._id }).length || 0;
              opt.progressVal = calPercen(ctrl.votedTotal, opt.voteCnt);
              ctrl.chart.colors.push(opt.color);
              ctrl.chart.labels.push(opt.title);
              ctrl.chart.data.push(opt.voteCnt);
            });
            $scope.$apply();
          })
          .catch(err => {
            toast.error(err.message, 'Error!');
          });
      });
      Socket.on('poll_delete', res => {
        toast.error('This poll has been deleted.', 'Error!');
        $state.go('polls.list');
      });
      Socket.on('poll_update', res => {
        Action.get_poll(ctrl.poll._id)
          .then(_poll => {
            ctrl.poll = _poll;
            process_before_show();
          }, err => {
            toast.error(err.message, 'Error!');
          });
      });
      Socket.on('opts_update', res => {
        Action.get_poll(ctrl.poll._id)
          .then(_poll => {
            ctrl.poll = _poll;
            process_before_show();
            $scope.$apply();
          }, err => {
            toast.error(err.message, 'Error!');
          });
      });
      $scope.$on('$destroy', function () {
        Socket.emit('unsubscribe_poll', {
          pollId: ctrl.poll._id,
          userId: $scope.user._id
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

    // Phân tích thông tin poll trước khi hiển thị.
    function process_before_show() {
      // Thiết lập các thông tin cho poll
      ctrl.poll.close = ctrl.poll.close ? moment(ctrl.poll.close) : ctrl.poll.close;
      ctrl.isClosed = ctrl.poll.close ? moment(ctrl.poll.close).isBefore(new moment()) : false;
      ctrl.opts = _.where(ctrl.poll.opts, { status: 1 });
      ctrl.chart = {
        type: 'pie',
        options: { responsive: true },
        colors: [],
        labels: [],
        data: []
      };
      ctrl.votes = ctrl.poll.votes || [];
      ctrl.voteopts = ctrl.poll.voteopts || [];
      ctrl.votedTotal = ctrl.voteopts.length;
      ctrl.opts.forEach(opt => {
        opt.voteCnt = _.where(ctrl.voteopts, { opt: opt._id }).length || 0;
        opt.progressVal = calPercen(ctrl.votedTotal, opt.voteCnt);
        ctrl.chart.colors.push(opt.color);
        ctrl.chart.labels.push(opt.title);
        ctrl.chart.data.push(opt.voteCnt);
      });
    }
    function get_owner_info() {
      Action.get_owner_by_pollId(ctrl.poll._id)
        .then(res => {
          ctrl.ownVote = res.data.ownVote;
          ctrl.votedOpts = res.data.votedOpts;
          ctrl.selectedOpts = _.clone(ctrl.votedOpts);
          ctrl.follow = res.data.follow;
          ctrl.reported = res.data.reported;
          ctrl.bookmarked = res.data.bookmarked;
          ctrl.like = res.data.like;
          ctrl.view = res.data.view;
        })
        .catch(err => {
          toast.error('Không thể load thông tin user' + err.message, 'Error!');
        });
    }

    ctrl.get_cmts = get_cmts;
    function get_cmts() {
      if (ctrl.stopped || ctrl.busy) return;
      ctrl.busy = true;
      Action.get_cmts(ctrl.poll._id, ctrl.page, ctrl.cmt_sort.val)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            ctrl.stopped = true;
            ctrl.busy = false;
            return;
          }
          // Gán data vào danh sách comment hiện tại
          ctrl.cmts = _.union(ctrl.cmts, res.data);
          ctrl.page += 1;
          ctrl.busy = false;
          if (res.data.length < 10) { ctrl.stopped = true; }
          // $scope.$apply();
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    }
    ctrl.sort = sort;
    function sort(index) {
      ctrl.cmt_sort = ctrl.cmt_sorts[index];
      ctrl.cmts = [];
      ctrl.page = 0;
      ctrl.busy = false;
      ctrl.stopped = false;
      get_cmts();
    }

    function loadRemaining() {
      ctrl.remaining = $timeout(makeRemaining, 1000);
      $scope.$on('$destroy', () => {
        $timeout.cancel(ctrl.remaining);
      });
    }

    function makeRemaining() {
      ctrl.close_duration = Remaining.duration(ctrl.poll.close);
      ctrl.isClosed = moment(ctrl.poll.close).isBefore(new moment());
      if (!ctrl.isClosed) {
        ctrl.remaining = $timeout(makeRemaining, 1000);
      } else {
        $timeout.cancel(ctrl.remaining);
      }
    }

    function save_viewed() {
      if (!ctrl.poll.isCurrentUserOwner) {
        var count_up = $timeout(() => {
          ctrl.poll.viewCnt += 1;
          Action.count_up_view_poll(ctrl.poll._id);
          if ($scope.isLogged) {
            Action.save_view_poll(ctrl.view);
          }
        }, 30000);
        $scope.$on('$destroy', () => {
          $timeout.cancel(count_up);
        });
      }
    }
    // Thao tác databse
    ctrl.save_cmt = save_cmt;
    function save_cmt() {
      if (
        !ctrl.tmp_cmt.body ||
        !ctrl.tmp_cmt.body.length ||
        ctrl.tmp_cmt.body.length === 0
      ) {
        toast.error('You must type something to reply.', 'Error!');
        return;
      }
      if (!$scope.isLogged) {
        $state.go('authentication.signin');
        return false;
      }
      if (ctrl.cmt_processing) {
        toast.error('Please wait until all comment be submit.', 'Error!');
        return;
      }
      ctrl.cmt_processing = true;
      Action.save_cmt(ctrl.poll, ctrl.tmp_cmt)
        .then(res => {
          ctrl.tmp_cmt = {};
          ctrl.cmt_processing = false;
          ctrl.cmt_typing = false;
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
          ctrl.cmt_processing = false;
        });
    }

    function save_vote() {
      if (!$scope.isLogged && !ctrl.poll.allow_guest) {
        return $state.go('authentication.signin');
      }
      if (!ctrl.selectedOpts.length || ctrl.selectedOpts.length === 0) {
        toast.error('You must vote at least one option.', 'Error!');
        return;
      }
      if (angular.equals(ctrl.votedOpts, ctrl.selectedOpts)) {
        return;
      }
      Action.save_vote(ctrl.ownVote, ctrl.selectedOpts, ctrl.poll)
        .then(res => {
          ctrl.ownVote = res;
          ctrl.votedOpts = _.clone(ctrl.selectedOpts);
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
          ctrl.selectedOpts = angular.copy(ctrl.votedOpts) || [];
        });
    }

    // Tính phần trăm tỉ lệ vote cho opt
    function calPercen(total, value) {
      if (total === 0) {
        return 0;
      }
      return Math.floor(value * 100 / total) || 0;
    }
    // Random code share poll
    function make_code() {
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (var i = 0; i < 10; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      return text;
    }

    // Remove existing Poll
    ctrl.remove = () => {
      $scope.message_title = 'Delete poll!';
      $scope.message_content = 'Are you sure you want to delete?';
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
        ctrl.poll.$remove(() => {
          Socket.emit('poll_delete', { pollId: ctrl.poll._id });
          $state.go('polls.list');
        });
      }
    };
    ctrl.share = () => {
      if (!ctrl.poll.share_code || ctrl.poll.share_code === '') {
        ctrl.poll.share_code = make_code();
        ctrl.poll.$update(() => {
          show_dialog();
        }, err => {
          toast.error(err.message, 'Error!');
        });
      } else {
        show_dialog();
      }
      function show_dialog() {
        $scope.message_title = 'Share poll!';
        $scope.message_content = 'Send url for anyone you want to share this poll.';
        $scope.message_url = $location.absUrl().split('?')[0] + '?share=' + ctrl.poll.share_code;
        dialog.openConfirm({
          scope: $scope,
          templateUrl: 'modules/core/client/views/templates/share.dialog.template.html'
        }).then(confirm => {
        }, reject => {
        });
      }
    };
    ctrl.like_poll = type => {
      if (!$scope.isLogged) {
        toast.error('You must login to like this poll.', 'Error!');
        return;
      }
      if (ctrl.poll.isCurrentUserOwner) {
        toast.error('You cannot like your poll.', 'Error!');
        return;
      }
      if (ctrl.like_processing) {
        toast.error('You cannot interact continuously.', 'Error!');
        return;
      }
      ctrl.like_processing = true;
      Action.save_like(ctrl.like, type, ctrl.poll)
        .then(res => {
          ctrl.poll.likeCnt = res.likeCnt;
          ctrl.like = res.like;
          ctrl.like_processing = false;
          $scope.$apply();
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
          ctrl.like_processing = false;
        });
    };

    ctrl.follow_poll = () => {
      if (!$scope.isLogged) {
        toast.error('You must login to follow this poll.', 'Error!');
        return;
      }
      Action.save_follow(ctrl.follow)
        .then(res => {
          if (res) {
            ctrl.follow = res;
            toast.success('You followed ' + ctrl.poll.title, 'Success!');
          } else {
            ctrl.follow = { poll: ctrl.poll._id };
          }
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    };

    ctrl.report_poll = (poll) => {
      if (ctrl.reported) {
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
        Action.save_report(ctrl.poll, reason)
          .then(res => {
            ctrl.reported = (res) ? true : false;
            $scope.$apply();
            toast.success('You have successfully reported this poll.', 'Thank you!');
          })
          .catch(err => {
            toast.error(err.message, 'Error!');
          });
      }
    };

    ctrl.bookmark_poll = () => {
      if (ctrl.bookmarked) {
        toast.error('You are already bookmark this poll.', 'Error!');
        return;
      }
      Action.save_bookmark(ctrl.poll._id)
        .then(res => {
          ctrl.bookmarked = (res) ? true : false;
          $scope.$apply();
          toast.success('Added to bookmarks.', 'Success!');
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    };
    // Click button add option
    ctrl.input_opt = opt => {
      ctrl.tmp_opt = (!opt) ? { poll: ctrl.poll._id, title: '', body: '', status: 2 } : opt;
      angular.element('body').toggleClass('aside-panel-open');
    };
    // Click button save option
    ctrl.save_opt = isValid => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'ctrl.form.optForm');
        return false;
      }
      Action.save_opt(ctrl.tmp_opt, ctrl.poll)
        .then(res => {
          angular.element('body').toggleClass('aside-panel-open');
          toast.success('Your option is waiting for approve.', 'Thank you!');
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    };
    ctrl.opt_full = () => {
      let aside = angular.element('.aside-panel')[0];
      angular.element(aside).toggleClass('full');
      angular.element('#aside-panel-full-toggle').find('i').toggleClass('r180');
    };

    ctrl.reply_cmt = cmt => {
      if (!$scope.isLogged) {
        toast.error('You must login to reply this comment.', 'Error!');
        return;
      }
      ctrl.tmp_cmt = {};
      ctrl.tmp_cmt.to = cmt.user._id;
      ctrl.tmp_cmt.toName = cmt.user.displayName;
      ctrl.tmp_cmt.discard = true;
      ctrl.cmt_typing = true;
    };

    ctrl.edit_cmt = cmt => {
      ctrl.tmp_cmt = _.clone(cmt);
      ctrl.tmp_cmt.discard = true;
      ctrl.cmt_typing = true;
    };

    ctrl.discard_cmt = () => {
      ctrl.tmp_cmt = {};
      ctrl.cmt_typing = false;
    };

    ctrl.delete_cmt = cmt => {
      $scope.message_title = 'Delete comment!';
      $scope.message_content = 'Are you sure you want to delete this comment?';
      $scope.dialog_type = 3;
      $scope.buton_label = 'delete';
      dialog.openConfirm({
        scope: $scope,
        templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
      }).then(confirm => {
        handle_delete_cmt();
      }, reject => {
      });
      function handle_delete_cmt() {
        ctrl.cmts = _.without(ctrl.cmts, cmt);
        Action.delete_cmt(cmt);
      }
    };
    var cnt = 0;
    ctrl.focus_cmt = () => {
      if (!$scope.isLogged) {
        toast.error('You must login to comment.', 'Error!');
        return;
      }
      ctrl.cmt_typing = true;
    };

    ctrl.like_cmt = (cmt, type) => {
      if (!$scope.isLogged) {
        toast.error('You must login to like this comment.', 'Error!');
        return;
      }
      if ($scope.user._id === cmt.user._id) {
        toast.error('You cannot like your comment.', 'Error!');
        return;
      }
      if (ctrl.like_processing) {
        toast.error('You cannot interact continuously.', 'Error!');
        return;
      }
      ctrl.like_processing = true;
      Action.save_like_cmt(cmt, type)
        .then(res => {
          cmt.like = res.like;
          cmt.likeCnt = res.likeCnt;
          ctrl.like_processing = false;
        })
        .catch(err => {
          ctrl.like_processing = false;
          toast.error(err.message, 'Error!');
        });
    };

    // VOTE
    ctrl.checked = function (id) {
      if (ctrl.poll.allow_multiple) {
        if (_.contains(ctrl.selectedOpts, id)) {
          ctrl.selectedOpts = _.without(ctrl.selectedOpts, id);
        } else {
          ctrl.selectedOpts.push(id);
        }
      } else {
        if (!_.contains(ctrl.selectedOpts, id)) {
          ctrl.selectedOpts = [id];
        }
      }
    };
    ctrl.is_can_vote = () => {
      if (ctrl.poll.allow_guest) {
        return true;
      } else {
        return $scope.isLogged;
      }
    };
    ctrl.is_voted = function (id) {
      return _.contains(ctrl.selectedOpts, id);
    };
    ctrl.is_voted_all = () => {
      return ctrl.selectedOpts.length === ctrl.opts.length;
    };
    ctrl.toggleAll = () => {
      if (ctrl.selectedOpts.length === ctrl.opts.length) {
        ctrl.selectedOpts = [];
      } else if (ctrl.selectedOpts.length === 0 || ctrl.selectedOpts.length > 0) {
        ctrl.selectedOpts = _.pluck(ctrl.opts, '_id');
      }
    };
    ctrl.isIndeterminate = () => {
      return (ctrl.selectedOpts.length !== 0 && ctrl.selectedOpts.length !== ctrl.opts.length);
    };
    ctrl.save_vote = save_vote;
    ctrl.toggle_chart = () => {
      ctrl.chart.type = ctrl.chart.type === 'polarArea' ?
        'pie' : 'polarArea';
    };

    // Share
    $scope.share = provider => {
      var url = $location.absUrl();
      // var url = 'http://notatsujapan.com';
      var text = ctrl.poll.title;
      if (provider === 'facebook') {
        Socialshare.share({
          'provider': 'facebook',
          'attrs': {
            'socialshareUrl': url,
            'socialshareHashtags': 'hanhatlenh',
            'socialshareQuote': text,
            'socialshareMobileiframe': true,
            'socialshareText': text
          }
        });
      } else if (provider === 'google') {
        Socialshare.share({
          'provider': provider,
          'attrs': {
            'socialshareUrl': url
          }
        });
      } else {
        Socialshare.share({
          'provider': provider,
          'attrs': {
            'socialshareUrl': url,
            'socialshareHashtags': 'hanhatlenh',
            'socialshareText': text
          }
        });
      }
    };
  }
})();
