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
    'ngDialog',
    '$stateParams',
    'Socialshare',
    'Notifications',
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
    dialog,
    $stateParams,
    Socialshare,
    Notifications,
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

    onPrepare();

    // Lấy id của poll trong đường dẫn để request API
    function onPrepare() {
      if (!$stateParams.pollId) {
        $state.go('home');
      } else {
        Action.get_poll($stateParams.pollId)
          .then(_poll => {
            ctrl.poll = _poll;
            onCreate();
          });
      }
    }
    // Init data
    function onCreate() {
      // Nếu poll không tồn tại thì về trang chủ
      if (!ctrl.poll._id) {
        $state.go('home');
        $scope.handleShowMessage('LB_POLL_EXIST_ERROR', true);
        return;
      }
      // Kiểm tra nếu poll là private và không có code share thì không show thông tin poll
      if (!ctrl.poll.isCurrentUserOwner && !ctrl.poll.isPublic && $stateParams.share !== ctrl.poll.share_code) {
        $state.go('home');
        $scope.handleShowMessage('LB_POLLS_PRIVATE_ERROR', true);
        return;
      }
      // Collect dữ liệu hiển thị màn hình
      prepareShowingData();
      // Lấy thông tin tương tác của người dùng với poll hiện tại
      prepareOwnerInfo();
      // Kiểm tra các tham số có trong url
      prepareUrlParameters();
      // Kiểm tra và đếm ngược thời gian close của poll
      prepareCloseRemaining();
      // Lắng nghe các request từ server socket
      prepareSocketListener();
      // Đặt timer lưu poll vào Viewed đồng thời tăng lượt View
      handleSaveViewed();
      get_cmts();
    }

    // Phân tích thông tin poll trước khi hiển thị.
    function prepareShowingData() {
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
    function prepareOwnerInfo() {
      Action.get_owner_by_pollId(ctrl.poll._id)
        .then(res => {
          ctrl.ownVote = res.data.ownVote;
          ctrl.votedOpts = res.data.votedOpts;
          ctrl.selectedOpts = _.clone(ctrl.votedOpts);
          ctrl.radioChecked = ctrl.selectedOpts[0];
          ctrl.follow = res.data.follow;
          ctrl.reported = res.data.reported;
          ctrl.bookmarked = res.data.bookmarked;
          ctrl.like = res.data.like;
          ctrl.view = res.data.view;
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    }
    function prepareUrlParameters() {
      // Kiểm tra thông báo
      prepareParamNotification();
      // Kiểm tra giá trị vote
      prepareParamVote();
    }

    function prepareParamNotification() {
      if ($stateParams.notif) {
        // Đánh dấu thông báo đã đọc
        Notifications.markReadNotif($stateParams.notif);
      }
    }
    // Kiểm tra url có chưa đối tượng vote
    function prepareParamVote() {
      if (!$stateParams.vote) return;
      // Kiểm tra mã vote có tồn tại trong danh sách option không
      var opt = _.findWhere(ctrl.opts, { _id: $stateParams.vote.trim() });
      // Nếu không tìm thấy thông tin option đúng với request thì show message
      if (!opt || !opt._id) return $scope.handleShowMessage('LB_POLL_VOTE_ERROR');
      // Kiểm tra điều kiện user có được vote hay không
      if (!ctrl.isCanVote) return $scope.handleShowMessage('LB_POLL_VOTE_AUTH_ERROR');
      // Kiểm tra user đã từng vote hay chưa
      if (ctrl.ownVote._id) {
        $scope.handleShowConfirm({
          content: 'LB_POLL_VOTE_CONFIRM',
          type: 1,
          button: 'LB_CHANGE'
        }, () => {
          ctrl.selectedOpts = [opt._id];
        });
      } else {
        ctrl.selectedOpts = [opt._id];
      }
    }
    // Init Socket
    function prepareSocketListener() {
      if (!Socket.socket) {
        Socket.connect();
      }
      Socket.emit('subscribe_poll', {
        pollId: ctrl.poll._id,
        userId: $scope.user._id
      });
      Socket.on('cmt_add', obj => {
        // Nếu tự nhận message của chính mình
        if (Socket.socket.socket.id === obj.client) return;
        Action.get_cmt(obj.cmtId)
          .then(res => {
            var _cmt = res.data || {};
            var item = _.findWhere(ctrl.cmts, { _id: _cmt._id });
            if (item) {
              _.extend(_.findWhere(ctrl.cmts, { _id: _cmt._id }), _cmt);
              if (!$scope.$$phase) $scope.$digest();
            } else {
              if (obj.isNew) {
                ctrl.cmts.push(_cmt);
                ctrl.poll.cmtCnt += 1;
                if (!$scope.$$phase) $scope.$digest();
              }
            }
          })
          .catch(err => {
            $scope.handleShowMessage(err.message, true);
          });
      });
      Socket.on('cmt_del', obj => {
        // Nếu tự nhận message của chính mình
        if (Socket.socket.socket.id === obj.client) return;
        ctrl.cmts = _.without(ctrl.cmts, _.findWhere(ctrl.cmts, { _id: obj.cmtId }));
        ctrl.poll.cmtCnt -= 1;
      });
      Socket.on('poll_vote', obj => {
        if (Socket.socket.socket.id === obj.client) return;
        excute_task();
      });
      Socket.on('poll_delete', obj => {
        if (Socket.socket.socket.id === obj.client) return;
        $scope.handleShowMessage('LB_POLLS_DELETED', true);
        $state.go('home');
      });
      Socket.on('poll_update', obj => {
        if (Socket.socket.socket.id === obj.client) return;
        Action.get_poll(ctrl.poll._id)
          .then(_poll => {
            ctrl.poll = _poll;
            prepareShowingData();
          }, err => {
            $scope.handleShowMessage(err.message, true);
          });
      });
      Socket.on('opts_update', res => {
        Action.get_poll(ctrl.poll._id)
          .then(_poll => {
            ctrl.poll = _poll;
            prepareShowingData();
          }, err => {
            $scope.handleShowMessage(err.message, true);
          });
      });
      $scope.$on('$destroy', function () {
        Socket.emit('unsubscribe_poll', {
          pollId: ctrl.poll._id,
          userId: $scope.user._id
        });
        Socket.removeListener('cmt_add');
        Socket.removeListener('cmt_del');
        // Socket.removeListener('poll_like');
        // Socket.removeListener('cmt_like');
        Socket.removeListener('poll_vote');
        Socket.removeListener('poll_delete');
        Socket.removeListener('poll_update');
        Socket.removeListener('opts_update');
        $timeout.cancel(ctrl.excute_timer);
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
          if (!$scope.$$phase) $scope.$digest();
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
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
    function loadVoteInfo() {
      return new Promise((resolve, reject) => {
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
            if (!$scope.$$phase) $scope.$digest();
            return resolve();
          })
          .catch(err => {
            $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
            return reject(err);
          });
      });
    }
    function prepareCloseRemaining() {
      // Nếu poll không thiết lập giới hạn, hoặc đã hết hạn thì bỏ qua
      if (ctrl.isClosed || !ctrl.poll.close) return;
      // Tạo biến timer chạy từng giây update count down
      ctrl.remaining = $timeout(handleCreateTimer, 1000);
      $scope.$on('$destroy', () => {
        $timeout.cancel(ctrl.remaining);
      });
    }
    function handleCreateTimer() {
      ctrl.close_duration = Remaining.duration(ctrl.poll.close);
      ctrl.isClosed = moment(ctrl.poll.close).isBefore(new moment());
      if (!ctrl.isClosed) {
        ctrl.remaining = $timeout(handleCreateTimer, 1000);
      } else {
        $timeout.cancel(ctrl.remaining);
      }
    }

    function handleSaveViewed() {
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
      if (!ctrl.tmp_cmt.body || !ctrl.tmp_cmt.body.length || ctrl.tmp_cmt.body.length === 0) {
        $scope.handleShowMessage('LB_POLLS_CMT_EMPTY', true);
        return;
      }
      if (!$scope.isLogged) {
        $state.go('authentication.signin');
        return false;
      }
      if (ctrl.cmt_processing) {
        $scope.handleShowMessage('LB_POLLS_CMT_WAIT', true);
        return;
      }
      ctrl.cmt_processing = true;
      Action.save_cmt(ctrl.poll, ctrl.tmp_cmt)
        .then(res => {
          ctrl.tmp_cmt = {};
          ctrl.cmt_processing = false;
          ctrl.cmt_typing = false;

          var item = _.findWhere(ctrl.cmts, { _id: res._id });
          if (item) {
            _.extend(_.findWhere(ctrl.cmts, { _id: res._id }), res);
          } else {
            if (res.isNew) {
              ctrl.cmts.push(res);
              ctrl.poll.cmtCnt += 1;
            }
          }
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
          ctrl.cmt_processing = false;
        });
    }

    ctrl.save_vote = save_vote;
    function save_vote() {
      if (!$scope.isLogged && !ctrl.poll.allow_guest) {
        return $state.go('authentication.signin');
      }
      if (!ctrl.selectedOpts.length || ctrl.selectedOpts.length === 0) {
        $scope.handleShowMessage('LB_POLLS_VOTE_EMPTY', true);
        return;
      }
      if (angular.equals(ctrl.votedOpts, ctrl.selectedOpts)) {
        return;
      }
      Action.save_vote(ctrl.ownVote, ctrl.selectedOpts, ctrl.poll)
        .then(res => {
          ctrl.ownVote = res;
          ctrl.votedOpts = _.clone(ctrl.selectedOpts);
          loadVoteInfo();
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
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
      // Gọi function show dialog từ scope cha
      $scope.handleShowConfirm({
        content: 'LB_POLLS_CONFIRM_DELETE',
        type: 3,
        button: 'LB_DELETE'
      }, confirm => {
        ctrl.poll.$remove(() => {
          Socket.emit('poll_delete', { pollId: ctrl.poll._id });
          $state.go('home');
        });
      });
    };
    ctrl.share = () => {
      if (!ctrl.poll.share_code || ctrl.poll.share_code === '') {
        ctrl.poll.share_code = make_code();
        ctrl.poll.$update(() => {
          show_dialog();
        }, err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
      } else {
        show_dialog();
      }
      function show_dialog() {
        $scope.message = {};
        $scope.message.content = 'LB_POLLS_SHARE';
        $scope.message.url = $location.absUrl().split('?')[0] + '?share=' + ctrl.poll.share_code;
        dialog.openConfirm({
          scope: $scope,
          templateUrl: 'modules/core/client/views/templates/share.dialog.template.html'
        }).then(confirm => {
        }, reject => {
          delete $scope.message;
        });
      }
    };
    ctrl.like_poll = type => {
      if (!$scope.isLogged) {
        $scope.handleShowMessage('MS_CM_LOGIN_ERROR', true);
        return;
      }
      if (ctrl.poll.isCurrentUserOwner) {
        $scope.handleShowMessage('LB_POLLS_LIKE_OWN', true);
        return;
      }
      if (ctrl.like_processing) {
        $scope.handleShowMessage('LB_POLLS_LIKE_MANY', true);
        return;
      }
      ctrl.like_processing = true;
      Action.save_like(ctrl.like, type, ctrl.poll)
        .then(res => {
          ctrl.poll.likeCnt = res.likeCnt;
          ctrl.like = res.like;
          ctrl.like_processing = false;
          if (!$scope.$$phase) $scope.$digest();
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
          ctrl.like_processing = false;
        });
    };

    ctrl.follow_poll = () => {
      if (!$scope.isLogged) {
        $scope.handleShowMessage('MS_CM_LOGIN_ERROR', true);
        return;
      }
      Action.save_follow(ctrl.follow)
        .then(res => {
          if (res) {
            ctrl.follow = res;
          } else {
            ctrl.follow = { poll: ctrl.poll._id };
          }
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    };

    ctrl.report_poll = () => {
      if (ctrl.reported) {
        $scope.handleShowMessageWithParam('MS_CM_REPORT_EXIST_ERROR', { title: ctrl.poll.title }, true);
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
            $scope.handleShowMessageWithParam('MS_CM_REPORT_SUCCESS', { title: ctrl.poll.title }, false);
          })
          .catch(err => {
            $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
          });
      }
    };

    ctrl.bookmark_poll = () => {
      if (ctrl.bookmarked) {
        $scope.handleShowMessageWithParam('MS_CM_BOOKMARK_EXIST_ERROR', { title: ctrl.poll.title }, true);
        return;
      }
      Action.save_bookmark(ctrl.poll._id)
        .then(res => {
          ctrl.bookmarked = (res) ? true : false;
          $scope.handleShowMessageWithParam('MS_CM_BOOKMARK_SUCCESS', { title: ctrl.poll.title }, false);
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    };
    // Click button add option
    ctrl.input_opt = opt => {
      if (!ctrl.poll.user) {
        $scope.handleShowMessage('LB_POLLS_SUGGEST_DELETED_USER', true);
        return;
      }
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
          $scope.handleShowMessage('LB_POLLS_SUGGEST_SUCCES', false);
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    };
    ctrl.opt_full = () => {
      let aside = angular.element('.aside-panel')[0];
      angular.element(aside).toggleClass('full');
      angular.element('#aside-panel-full-toggle').find('i').toggleClass('r180');
    };

    ctrl.reply_cmt = cmt => {
      if (!$scope.isLogged) {
        $scope.handleShowMessage('MS_CM_LOGIN_ERROR', true);
        return;
      }
      if (!cmt.user) {
        $scope.handleShowMessage('LB_POLLS_REPLY_DELETED_USER', true);
        return;
      }
      ctrl.tmp_cmt = {};
      ctrl.tmp_cmt.to = cmt.user;
      ctrl.tmp_cmt.toName = cmt.user.displayName;
      ctrl.tmp_cmt.toSlug = cmt.user.slug;
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
      // Gọi function show dialog từ scope cha
      $scope.handleShowConfirm({
        content: 'LB_POLLS_CONFIRM_DELETE_CMT',
        type: 3,
        button: 'LB_DELETE'
      }, confirm => {
        ctrl.cmts = _.without(ctrl.cmts, cmt);
        ctrl.poll.cmtCnt -= 1;
        Action.delete_cmt(cmt);
      });
    };
    var cnt = 0;
    ctrl.focus_cmt = () => {
      if (!$scope.isLogged) {
        $scope.handleShowMessage('MS_CM_LOGIN_ERROR', true);
        return;
      }
      ctrl.cmt_typing = true;
    };

    ctrl.like_cmt = (cmt, type) => {
      if (!$scope.isLogged) {
        $scope.handleShowMessage('MS_CM_LOGIN_ERROR', true);
        return;
      }
      if ($scope.user.user._id === cmt.user._id) {
        $scope.handleShowMessage('LB_POLLS_LIKE_CMT_OWN', true);
        return;
      }
      if (ctrl.like_processing) {
        $scope.handleShowMessage('LB_POLLS_LIKE_MANY', true);
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
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    };

    // VOTE
    ctrl.handleChecked = (id) => {
      if (ctrl.poll.allow_multiple) {
        if (_.contains(ctrl.selectedOpts, id)) {
          ctrl.selectedOpts = _.without(ctrl.selectedOpts, id);
        } else {
          ctrl.selectedOpts.push(id);
        }
      } else {
        if (!_.contains(ctrl.selectedOpts, ctrl.radioChecked)) {
          ctrl.selectedOpts = [ctrl.radioChecked];
        }
      }
    };
    ctrl.isCanVote = () => {
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

    ctrl.task_queue = {
      is_watting: false,
      last_task_time: 0
    };
    ctrl.excute_timer = {};
    function excute_task() {
      var now = new Date().getTime();
      var dif = now - ctrl.task_queue.last_task_time;
      if (dif > 5000) {
        loadVoteInfo()
          .then(() => {
            ctrl.task_queue.last_task_time = now;
            ctrl.task_queue.is_watting = false;
            $timeout.cancel(ctrl.excute_timer);
          })
          .catch(err => {
            ctrl.task_queue.last_task_time = now;
            ctrl.task_queue.is_watting = false;
            $timeout.cancel(ctrl.excute_timer);
          });
      } else {
        if (!ctrl.task_queue.is_watting) {
          ctrl.task_queue.is_watting = true;
          ctrl.excute_timer = $timeout(excute_task, (5000 - dif + 1000));
        }
      }
    }

  }
})();
