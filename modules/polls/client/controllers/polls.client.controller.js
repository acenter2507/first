(function () {
  'use strict';
  // Polls controller
  angular.module('polls')
    .controller('PollsController', PollsController);

  PollsController.$inject = [
    '$location',
    '$document',
    '$scope',
    '$state',
    'Socket',
    '$timeout',
    'Remaining',
    'Action',
    'ngDialog',
    '$stateParams',
    'Notifications'
  ];

  function PollsController(
    $location,
    $document,
    $scope,
    $state,
    Socket,
    $timeout,
    Remaining,
    Action,
    dialog,
    $stateParams,
    Notifications
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
            console.log(_poll);
            ctrl.poll = _poll;
            onCreate();
          });
      }
    }
    // Init data
    function onCreate() {
      // Nếu poll không tồn tại thì về trang chủ
      if (!ctrl.poll || !ctrl.poll._id) {
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
      $scope.handleChangePageTitle(ctrl.poll.title);
      // Lấy thông tin tương tác của người dùng với poll hiện tại
      prepareOwnerInfo().then(() => {
        // Kiểm tra giá trị vote
        prepareParamVote();
      });
      // Kiểm tra thông báo
      prepareParamNotification();
      // Collect dữ liệu hiển thị màn hình
      prepareShowingData();
      // Lắng nghe các request từ server socket
      prepareSocketListener();
      // Đặt timer lưu poll vào Viewed đồng thời tăng lượt View
      handleSaveViewed();
      // Load comment
      handleLoadComments();
      // Kiểm tra và đếm ngược thời gian close của poll
      prepareCloseRemaining();
    }

    function prepareShowingData() {
      // Thiết lập các thông tin cho poll
      ctrl.poll.close = ctrl.poll.close ? moment(ctrl.poll.close) : ctrl.poll.close;
      ctrl.isClosed = ctrl.poll.close ? moment(ctrl.poll.close).isBefore(new moment().utc()) : false;
      ctrl.opts = _.where(ctrl.poll.opts, { status: 1 });
      ctrl.chart = {
        type: 'pie',
        options: {
          responsive: true
        },
        colors: [],
        labels: [],
        data: []
      };
      ctrl.votes = ctrl.poll.votes || [];
      ctrl.voteopts = handleGetVoteOptionInVote(ctrl.votes);
      ctrl.votedTotal = ctrl.voteopts.length;

      var result = _.map(ctrl.opts, function (opt) {
        var length = _.reject(ctrl.voteopts, function (el) {
          return el.toString() !== opt._id.toString();
        }).length;
        return { opt: opt._id, count: length };
      });
      console.log(result);
      ctrl.opts.forEach(opt => {
        opt.voteCnt = 0;
        opt.progressVal = Action.calPercen(ctrl.votedTotal, opt.voteCnt);
        ctrl.chart.colors.push(opt.color);
        ctrl.chart.labels.push(opt.title);
        ctrl.chart.data.push(opt.voteCnt);
      });
    }
    function handleGetVoteOptionInVote(votes) {
      var voteOpts = [];
      votes.forEach(vote => {
        voteOpts = _.union(voteOpts, vote.opts);
      });
      return voteOpts;
    }
    function prepareOwnerInfo() {
      return new Promise((resolve, reject) => {
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
            return resolve();
          })
          .catch(err => {
            $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
            return reject();
          });
      });
    }
    function prepareParamNotification() {
      if ($stateParams.notif) {
        // Đánh dấu thông báo đã đọc
        Notifications.markReadNotif($stateParams.notif);
      }
    }
    function prepareParamVote() {
      if (!$stateParams.vote) return;
      // Kiểm tra mã vote có tồn tại trong danh sách option không
      var opt = _.findWhere(ctrl.opts, { _id: $stateParams.vote.trim() });
      // Nếu không tìm thấy thông tin option đúng với request thì show message
      if (!opt || !opt._id) return $scope.handleShowMessage('LB_POLL_VOTE_ERROR', true);
      // Kiểm tra điều kiện user có được vote hay không
      if (!ctrl.isCanVote) return $scope.handleShowMessage('LB_POLL_VOTE_AUTH_ERROR', true);
      // Kiểm tra user đã từng vote hay chưa
      if (ctrl.ownVote._id) {
        $scope.handleShowConfirm({
          content: 'LB_POLL_VOTE_CONFIRM',
          type: 1,
          button: 'LB_CHANGE'
        }, () => {
          ctrl.selectedOpts = [opt._id];
          ctrl.radioChecked = opt._id;
          handleSaveVote();
        });
      } else {
        ctrl.selectedOpts = [opt._id];
        handleSaveVote();
      }
    }
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
    function prepareCloseRemaining() {
      // Nếu poll không thiết lập giới hạn, hoặc đã hết hạn thì bỏ qua
      if (ctrl.isClosed || !ctrl.poll.close) return;
      // Tạo biến timer chạy từng giây update count down
      ctrl.remaining = $timeout(handleCreateTimer, 1000);
      $scope.$on('$destroy', () => {
        $timeout.cancel(ctrl.remaining);
      });
    }

    /**
     * HANDLES
     */
    // Lấy comments từ server
    ctrl.handleLoadComments = handleLoadComments;
    function handleLoadComments() {
      if (ctrl.stopped || ctrl.busy) return;
      ctrl.busy = true;
      Action.get_cmts(ctrl.poll._id, ctrl.page, ctrl.cmt_sort.val)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            ctrl.stopped = true;
            ctrl.busy = false;
          } else {
            // Gán data vào danh sách comment hiện tại
            ctrl.cmts = _.union(ctrl.cmts, res.data);
            ctrl.page += 1;
            ctrl.busy = false;
            if (res.data.length < 10) { ctrl.stopped = true; }
          }
          if (!$scope.$$phase) $scope.$digest();
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    }
    // Lưu comment
    ctrl.handleSaveComment = handleSaveComment;
    function handleSaveComment() {
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
    // Lưu thông tin bình chọn
    ctrl.handleSaveVote = handleSaveVote;
    function handleSaveVote() {
      // Nếu chưa đăng nhập mà gặp phải poll chỉ cho thành viên
      if (!$scope.isLogged && !ctrl.poll.allow_guest) {
        return $state.go('authentication.signin');
      }
      // Nếu không vote cho cái nào mà bấm
      if (!ctrl.selectedOpts.length || ctrl.selectedOpts.length === 0) {
        $scope.handleShowMessage('LB_POLLS_VOTE_EMPTY', true);
        return;
      }
      // Nếu thông tin mới và cũ giống nhau
      if (angular.equals(ctrl.votedOpts, ctrl.selectedOpts)) {
        return;
      }
      // Nếu poll đã hết thời hạn
      if (ctrl.isClosed) {
        $scope.handleShowMessage('LB_POLL_CLOSED', true);
        return;
      }
      // Kiểm tra vote spam
      if (ctrl.ownVote.updateCnt >= 10) {
        let updatedTime = moment(ctrl.ownVote.updated).utc();
        let now = moment().utc();
        let duration = now.diff(updatedTime, 'minutes');
        if (duration < 30) {
          $scope.handleShowMessageWithParam('LB_VOTE_DENY', { minute: (30 - duration) }, true);
          return;
        }
      }
      Action.save_vote(ctrl.ownVote, ctrl.selectedOpts, ctrl.poll)
        .then(res => {
          if (!ctrl.ownVote._id) {
            ctrl.poll.voteCnt += 1;
          }
          ctrl.ownVote = res;
          ctrl.votedOpts = _.clone(ctrl.selectedOpts);
          handleLoadNewVoteInfo();
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
          ctrl.selectedOpts = angular.copy(ctrl.votedOpts) || [];
        });
    }
    // Sắp xếp comments
    ctrl.handleSortComments = handleSortComments;
    function handleSortComments(index) {
      ctrl.cmt_sort = ctrl.cmt_sorts[index];
      ctrl.cmts = [];
      ctrl.page = 0;
      ctrl.busy = false;
      ctrl.stopped = false;
      handleLoadComments();
    }
    // Share poll với url
    ctrl.handleSharePoll = handleSharePoll;
    function handleSharePoll() {
      if (!ctrl.poll.share_code || ctrl.poll.share_code === '') {
        ctrl.poll.share_code = handleGenerateShareCode();
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
          delete $scope.message;
        }, reject => {
          delete $scope.message;
        });
      }
    }
    // Share poll với url
    ctrl.handleGetLinkOption = handleGetLinkOption;
    function handleGetLinkOption() {
      var url = $location.absUrl().split('?')[0] + '?vote=';
      function handleSeletedOption() {
        $scope.linkOptionData.url = $scope.linkOptionData.baseUrl + $scope.linkOptionData.selected;
      }
      $scope.linkOptionData = {
        baseUrl: url,
        opts: ctrl.opts,
        selected: ctrl.opts[0]._id,
        url: url + ctrl.opts[0]._id,
        handleSeletedOption: handleSeletedOption
      };
      dialog.openConfirm({
        scope: $scope,
        template: 'getLinkOptionTemplate'
      }, () => {
        delete $scope.linkOptionData;
      }, () => {
        delete $scope.linkOptionData;
      });
    }
    // Remove existing Poll
    ctrl.handleRemovePoll = handleRemovePoll;
    function handleRemovePoll() {
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
    }
    // Người dùng click button like poll
    ctrl.handleLikePoll = handleLikePoll;
    function handleLikePoll(type) {
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
          ctrl.like = res.like || {};
          ctrl.like_processing = false;
          if (!$scope.$$phase) $scope.$digest();
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
          ctrl.like_processing = false;
        });
    }
    // Người dùng trỏ chuột đến 
    ctrl.handleMouseEnterOption = handleMouseEnterOption;
    function handleMouseEnterOption(opt) {
      opt.loadUserTimer = $timeout(loadAllUsersVotedForThisOption, 500);
      // Lấy tất cả các user đã vote cho lựa chọn này
      function loadAllUsersVotedForThisOption() {
        // Lấy các vote đã có vote cho option hiện tại
        var _votes = _.pluck(_.where(ctrl.voteopts, { opt: opt._id }), 'vote');
        // Lấy các lần vote có có vote cho option hiện tại
        opt.votes = _.filter(ctrl.votes, (vote) => {
          return _.contains(_votes, vote._id);
        });
        // Lấy các user đã vote cho option hiện tại
        opt.users = _.pluck(_.filter(opt.votes, (vote) => {
          return !vote.guest;
        }), 'user');
        // Đếm số guest và số user đã vote
        opt.voteCollect = _.countBy(opt.votes, function (vote) {
          return vote.guest ? 'guest' : 'users';
        });
        $timeout.cancel(opt.loadUserTimer);
      }
    }
    // Người dùng trỏ chuột đến 
    ctrl.handleMouseClickOption = handleMouseClickOption;
    function handleMouseClickOption(opt) {
      $scope.dialogData = {
        loading: true,
        title: opt.title
      };
      var dlg = dialog.open({
        templateUrl: 'modules/core/client/views/templates/popup-users.dialog.template.html',
        scope: $scope,
        appendClassName: 'images-upload-dialog'
      });
      Action.get_votes_by_opt(opt._id)
        .then(res => {
          $scope.dialogData.votes = res.data || [];
          $scope.dialogData.message = 'LB_VOTE_EMPTY';
          $scope.dialogData.loading = false;
          if (!$scope.$$phase) $scope.$digest();
        })
        .catch(err => {
          $scope.dialogData.votes = [];
          $scope.dialogData.loading = false;
          $scope.dialogData.message = 'MS_CM_LOAD_ERROR';
        });

      dlg.closePromise.then(function (data) {
        delete $scope.dialogData;
      });
    }
    // Người dùng trỏ chuột đến 
    ctrl.handleMouseLeaveOption = handleMouseLeaveOption;
    function handleMouseLeaveOption(opt) {
      $timeout.cancel(opt.loadUserTimer);
      delete opt.loadUserTimer;
    }
    // Tạo Timer đếm ngược
    function handleCreateTimer() {
      ctrl.close_duration = Remaining.duration(ctrl.poll.close);
      ctrl.isClosed = moment(ctrl.poll.close).isBefore(new moment());
      if (!ctrl.isClosed) {
        ctrl.remaining = $timeout(handleCreateTimer, 1000);
      } else {
        $timeout.cancel(ctrl.remaining);
      }
    }
    // Lưu poll vào viewed và tăng lượt view
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
    // Tạo code share cho poll
    function handleGenerateShareCode() {
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (var i = 0; i < 10; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      return text;
    }
    // Load mới thông tin đã vote của poll (khi có ai đó vote)
    function handleLoadNewVoteInfo() {
      return new Promise((resolve, reject) => {
        Action.get_voteopts(ctrl.poll._id)
          .then(res => { // lấy thông tin vote
            ctrl.chart.colors = [];
            ctrl.chart.labels = [];
            ctrl.chart.data = [];
            ctrl.votes = res.data.votes || [];
            ctrl.voteopts = res.data.voteopts || [];
            ctrl.votedTotal = ctrl.voteopts.length;
            ctrl.opts.forEach(opt => {
              opt.voteCnt = _.where(ctrl.voteopts, { opt: opt._id }).length || 0;
              opt.progressVal = Action.calPercen(ctrl.votedTotal, opt.voteCnt);
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

    // Thành viên bấm follow poll
    ctrl.handleFollowPoll = () => {
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
    // Thành viên bấm report poll
    ctrl.handleReportPoll = () => {
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
    // Thành viên bấm add bookmart poll
    ctrl.handleBookmarkPoll = () => {
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
    ctrl.handleStartInputOption = handleStartInputOption;
    function handleStartInputOption() {
      if (!ctrl.poll.user) {
        $scope.handleShowMessage('LB_POLLS_SUGGEST_DELETED_USER', true);
        return;
      }
      ctrl.tmp_opt = { poll: ctrl.poll._id, title: '', body: '', status: 2 };
      angular.element('body').toggleClass('aside-panel-open');
    }
    // Click button save option
    ctrl.handleSaveOption = handleSaveOption;
    function handleSaveOption(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'ctrl.form.optForm');
        return false;
      }
      Action.save_opt(ctrl.tmp_opt, ctrl.poll)
        .then(res => {
          $scope.$broadcast('show-errors-reset', 'ctrl.form.optForm');
          angular.element('body').removeClass('aside-panel-open');
          $scope.handleShowMessage('LB_POLLS_SUGGEST_SUCCES', false);
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
          $scope.$broadcast('show-errors-reset', 'ctrl.form.optForm');
          angular.element('body').removeClass('aside-panel-open');
        });
    }
    ctrl.handleShowFullOption = handleShowFullOption;
    function handleShowFullOption() {
      let aside = angular.element('.aside-panel')[0];
      angular.element(aside).toggleClass('full');
      angular.element('#aside-panel-full-toggle').find('i').toggleClass('r180');
    }
    // Thành viên trả lời comment của thành viên khác
    ctrl.handleReplyComment = cmt => {
      if (!$scope.isLogged) {
        $scope.handleShowMessage('MS_CM_LOGIN_ERROR', true);
        return;
      }
      if (!cmt.user) {
        $scope.handleShowMessage('LB_POLLS_REPLY_DELETED_USER', true);
        return;
      }
      ctrl.tmp_cmt = {
        to: cmt.user,
        toName: cmt.user.displayName,
        toSlug: cmt.user.slug,
        discard: true
      };
      ctrl.cmt_typing = true;
    };
    // Thành viên chọn sửa comment của minh
    ctrl.handleEditComment = cmt => {
      ctrl.tmp_cmt = _.clone(cmt);
      ctrl.tmp_cmt.discard = true;
      ctrl.cmt_typing = true;
    };
    // Thành viên huỷ bỏ type comment
    ctrl.handleDiscardComment = () => {
      ctrl.tmp_cmt = {};
      ctrl.cmt_typing = false;
    };
    // Xóa comment
    ctrl.handleDeleteComment = cmt => {
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
    // Bắt đầu nhập comment
    ctrl.handleStartTypeComment = () => {
      if (!$scope.isLogged) {
        $scope.handleShowMessage('MS_CM_LOGIN_ERROR', true);
        return;
      }
      ctrl.cmt_typing = true;
      let commentBox = angular.element(document.getElementById('comment-box'));
      $document.scrollToElementAnimated(commentBox, 100);
    };
    // Thành viên like comment
    ctrl.handleLikeComment = (cmt, type) => {
      if (!$scope.isLogged) {
        $scope.handleShowMessage('MS_CM_LOGIN_ERROR', true);
        return;
      }
      if ($scope.user._id === cmt.user._id) {
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
          cmt.like = res.like || {};
          cmt.likeCnt = res.likeCnt;
          ctrl.like_processing = false;
          if (!$scope.$$phase) $scope.$digest();
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
        ctrl.selectedOpts = [ctrl.radioChecked];
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

    ctrl.task_queue = {
      is_watting: false,
      last_task_time: 0
    };
    ctrl.excute_timer = {};
    function excute_task() {
      var now = new Date().getTime();
      var dif = now - ctrl.task_queue.last_task_time;
      if (dif > 5000) {
        handleLoadNewVoteInfo()
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
