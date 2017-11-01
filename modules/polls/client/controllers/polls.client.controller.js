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
    var vm = this;
    vm.form = {};
    // Options variable
    vm.opts = [];
    vm.tmp_opt = {};
    vm.selectedOpts = [];

    // Sắp xếp comments
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
    vm.page = 1;
    vm.busy = false;
    vm.stopped = false;

    vm.cmt_processing = false;
    vm.cmt_typing = false;
    vm.like_processing = false;
    vm.tmp_cmt = {};
    vm.optionToggle = -1;

    vm.close_duration = {};
    vm.remaining = 1;

    onPrepare();

    // Lấy id của poll trong đường dẫn để request API
    function onPrepare() {
      if (!$stateParams.pollId) {
        $state.go('home');
      } else {
        Action.loadPollById($stateParams.pollId)
          .then(_poll => {
            vm.poll = _poll;
            onCreate();
          });
      }
    }
    // Init data
    function onCreate() {
      // Nếu poll không tồn tại thì về trang chủ
      if (!vm.poll || !vm.poll._id) {
        $state.go('home');
        $scope.handleShowMessage('LB_POLL_EXIST_ERROR', true);
        return;
      }
      // Kiểm tra nếu poll là private và không có code share thì không show thông tin poll
      if (!vm.poll.isCurrentUserOwner && !vm.poll.isPublic && $stateParams.share !== vm.poll.share_code) {
        $state.go('home');
        $scope.handleShowMessage('LB_POLLS_PRIVATE_ERROR', true);
        return;
      }
      $scope.handleChangePageTitle(vm.poll.title);
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
      vm.poll.close = vm.poll.close ? moment(vm.poll.close).utc() : vm.poll.close;
      vm.isClosed = vm.poll.close ? moment(vm.poll.close).utc().isBefore(new moment().utc()) : false;
      vm.opts = _.where(vm.poll.opts, { status: 1 });
      vm.chart = {
        type: 'pie',
        options: {
          responsive: true
        },
        colors: [],
        labels: [],
        data: []
      };
      vm.votes = vm.poll.votes || [];
      vm.voteopts = Action.getOptionsInVotes(vm.votes);
      vm.votedTotal = vm.voteopts.length;
      var collect = Action.countByOptions(vm.opts, vm.voteopts);

      vm.opts.forEach(opt => {
        opt.voteCnt = _.findWhere(collect, { opt: opt._id }).count;
        opt.progressVal = Action.calPercen(vm.votedTotal, opt.voteCnt);
        vm.chart.colors.push(opt.color);
        vm.chart.labels.push(opt.title);
        vm.chart.data.push(opt.voteCnt);
      });
    }
    function prepareOwnerInfo() {
      return new Promise((resolve, reject) => {
        Action.loadOwnerInfo(vm.poll._id)
          .then(res => {
            vm.ownVote = res.data.ownVote;
            vm.selectedOpts = vm.ownVote._id ? _.clone(vm.ownVote.opts) : [];
            vm.radioChecked = vm.selectedOpts[0];
            vm.follow = res.data.follow;
            vm.reported = res.data.reported;
            vm.bookmarked = res.data.bookmarked;
            vm.like = res.data.like;
            vm.view = res.data.view;
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
      var opt = _.findWhere(vm.opts, { _id: $stateParams.vote.trim() });
      // Nếu không tìm thấy thông tin option đúng với request thì show message
      if (!opt || !opt._id) return $scope.handleShowMessage('LB_POLL_VOTE_ERROR', true);
      // Kiểm tra điều kiện user có được vote hay không
      if (!vm.isCanVote) return $scope.handleShowMessage('LB_POLL_VOTE_AUTH_ERROR', true);
      // Kiểm tra user đã từng vote hay chưa
      if (vm.ownVote._id) {
        $scope.handleShowConfirm({
          content: 'LB_POLL_VOTE_CONFIRM',
          type: 1,
          button: 'LB_CHANGE'
        }, () => {
          vm.selectedOpts = [opt._id];
          vm.radioChecked = opt._id;
          handleSaveVote();
        });
      } else {
        vm.selectedOpts = [opt._id];
        handleSaveVote();
      }
    }
    function prepareSocketListener() {
      if (!Socket.socket) {
        Socket.connect();
      }
      Socket.emit('subscribe_poll', {
        pollId: vm.poll._id,
        userId: $scope.user._id
      });
      Socket.on('cmt_add', obj => {
        // Nếu tự nhận message của chính mình
        if (Socket.socket.socket.id === obj.client) return;
        Action.loadCommentById(obj.cmtId)
          .then(cmt => {
            if (!cmt) return;
            var item = _.findWhere(vm.cmts, { _id: cmt._id });
            if (item) {
              _.extend(_.findWhere(vm.cmts, { _id: cmt._id }), cmt);
              if (!$scope.$$phase) $scope.$digest();
            } else {
              if (obj.isNew) {
                vm.cmts.push(cmt);
                vm.poll.cmtCnt += 1;
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
        vm.cmts = _.without(vm.cmts, _.findWhere(vm.cmts, { _id: obj.cmtId }));
        vm.poll.cmtCnt -= 1;
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
        Action.loadPollById(vm.poll._id)
          .then(_poll => {
            vm.poll = _poll;
            prepareShowingData();
          }, err => {
            $scope.handleShowMessage(err.message, true);
          });
      });
      Socket.on('opts_update', res => {
        Action.loadPollById(vm.poll._id)
          .then(_poll => {
            vm.poll = _poll;
            prepareShowingData();
          }, err => {
            $scope.handleShowMessage(err.message, true);
          });
      });
      $scope.$on('$destroy', function () {
        Socket.emit('unsubscribe_poll', {
          pollId: vm.poll._id,
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
        $timeout.cancel(vm.excute_timer);
      });
    }
    function prepareCloseRemaining() {
      // Nếu poll không thiết lập giới hạn, hoặc đã hết hạn thì bỏ qua
      if (vm.isClosed || !vm.poll.close) return;
      // Tạo biến timer chạy từng giây update count down
      vm.remaining = $timeout(handleCreateTimer, 1000);
      $scope.$on('$destroy', () => {
        $timeout.cancel(vm.remaining);
      });
    }

    /**
     * HANDLES
     */
    // Lấy comments từ server
    vm.handleLoadComments = handleLoadComments;
    function handleLoadComments() {
      if (vm.stopped || vm.busy) return;
      vm.busy = true;
      Action.loadComments(vm.poll._id, vm.page, vm.cmt_sort.val)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            vm.stopped = true;
            vm.busy = false;
          } else {
            // Gán data vào danh sách comment hiện tại
            vm.cmts = _.union(vm.cmts, res.data);
            vm.page += 1;
            vm.busy = false;
            if (res.data.length < 10) vm.stopped = true;
          }
          if (!$scope.$$phase) $scope.$digest();
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    }
    // Lưu comment
    vm.handleSaveComment = handleSaveComment;
    function handleSaveComment() {
      if (!vm.tmp_cmt.body || !vm.tmp_cmt.body.length || vm.tmp_cmt.body.length === 0) {
        $scope.handleShowMessage('LB_POLLS_CMT_EMPTY', true);
        return;
      }
      if (!$scope.isLogged) {
        $state.go('authentication.signin');
        return false;
      }
      if (vm.cmt_processing) {
        $scope.handleShowMessage('LB_POLLS_CMT_WAIT', true);
        return;
      }
      vm.cmt_processing = true;
      vm.tmp_cmt.poll = vm.poll._id;
      Action.saveComment(vm.tmp_cmt)
        .then(res => {
          vm.tmp_cmt = {};
          vm.cmt_processing = false;
          vm.cmt_typing = false;

          var item = _.findWhere(vm.cmts, { _id: res._id });
          if (item) {
            _.extend(_.findWhere(vm.cmts, { _id: res._id }), res);
          } else {
            if (res.isNew) {
              vm.cmts.push(res);
              vm.poll.cmtCnt += 1;
            }
          }
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
          vm.cmt_processing = false;
        });
    }
    // Lưu thông tin bình chọn
    vm.handleSaveVote = handleSaveVote;
    function handleSaveVote() {
      // Nếu chưa đăng nhập mà gặp phải poll chỉ cho thành viên
      if (!$scope.isLogged && !vm.poll.allow_guest) {
        return $state.go('authentication.signin');
      }
      // Nếu không vote cho cái nào mà bấm
      if (!vm.selectedOpts.length || vm.selectedOpts.length === 0) {
        $scope.handleShowMessage('LB_POLLS_VOTE_EMPTY', true);
        return;
      }
      // Nếu thông tin mới và cũ giống nhau
      if (angular.equals(vm.ownVote.opts, vm.selectedOpts)) {
        return;
      }
      // Nếu poll đã hết thời hạn
      if (vm.isClosed) {
        $scope.handleShowMessage('LB_POLL_CLOSED', true);
        return;
      }
      // Kiểm tra vote spam
      if (vm.ownVote.updateCnt >= 10) {
        let updatedTime = moment(vm.ownVote.updated).utc();
        let now = moment().utc();
        let duration = now.diff(updatedTime, 'minutes');
        if (duration < 30) {
          $scope.handleShowMessageWithParam('LB_VOTE_DENY', { minute: (30 - duration) }, true);
          return;
        }
      }
      Action.saveVote(vm.ownVote, vm.selectedOpts, vm.poll)
        .then(res => {
          if (!vm.ownVote._id) {
            vm.poll.voteCnt += 1;
          }
          vm.ownVote = res;
          handleLoadNewVoteInfo();
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
          vm.selectedOpts = vm.ownVote.opts || [];
        });
    }
    // Sắp xếp comments
    vm.handleSortComments = handleSortComments;
    function handleSortComments(index) {
      vm.cmt_sort = vm.cmt_sorts[index];
      vm.cmts = [];
      vm.page = 1;
      vm.busy = false;
      vm.stopped = false;
      handleLoadComments();
    }
    // Share poll với url
    vm.handleSharePoll = handleSharePoll;
    function handleSharePoll() {
      if (!vm.poll.share_code || vm.poll.share_code === '') {
        vm.poll.share_code = handleGenerateShareCode();
        vm.poll.$update(() => {
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
        $scope.message.url = $location.absUrl().split('?')[0] + '?share=' + vm.poll.share_code;
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
    vm.handleGetLinkOption = handleGetLinkOption;
    function handleGetLinkOption() {
      var url = $location.absUrl().split('?')[0] + '?vote=';
      function handleSeletedOption() {
        $scope.linkOptionData.url = $scope.linkOptionData.baseUrl + $scope.linkOptionData.selected;
      }
      $scope.linkOptionData = {
        baseUrl: url,
        opts: vm.opts,
        selected: vm.opts[0]._id,
        url: url + vm.opts[0]._id,
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
    vm.handleRemovePoll = handleRemovePoll;
    function handleRemovePoll() {
      // Gọi function show dialog từ scope cha
      $scope.handleShowConfirm({
        content: 'LB_POLLS_CONFIRM_DELETE',
        type: 3,
        button: 'LB_DELETE'
      }, confirm => {
        vm.poll.$remove(() => {
          Socket.emit('poll_delete', { pollId: vm.poll._id });
          $state.go('home');
        });
      });
    }
    // Người dùng click button like poll
    vm.handleLikePoll = handleLikePoll;
    function handleLikePoll(type) {
      if (!$scope.isLogged) {
        $scope.handleShowMessage('MS_CM_LOGIN_ERROR', true);
        return;
      }
      if (vm.poll.isCurrentUserOwner) {
        $scope.handleShowMessage('LB_POLLS_LIKE_OWN', true);
        return;
      }
      if (vm.like_processing) {
        $scope.handleShowMessage('LB_POLLS_LIKE_MANY', true);
        return;
      }
      vm.like_processing = true;
      Action.saveLikePoll(vm.like, type, vm.poll)
        .then(res => {
          vm.poll.likeCnt = res.likeCnt;
          vm.like = res.like || {};
          vm.like_processing = false;
          if (!$scope.$$phase) $scope.$digest();
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
          vm.like_processing = false;
        });
    }
    // Người dùng trỏ chuột đến 
    vm.handleMouseEnterOption = handleMouseEnterOption;
    function handleMouseEnterOption(opt) {
      opt.loadUserTimer = $timeout(loadAllUsersVotedForThisOption, 500);
      // Lấy tất cả các user đã vote cho lựa chọn này
      function loadAllUsersVotedForThisOption() {
        // Lấy các vote đã có vote cho option hiện tại
        opt.votes = _.filter(vm.votes, (vote) => { return _.contains(vote.opts, opt._id); });
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
    vm.handleMouseClickOption = handleMouseClickOption;
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
      Action.loadVotesByOptionId(opt._id)
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
    vm.handleMouseLeaveOption = handleMouseLeaveOption;
    function handleMouseLeaveOption(opt) {
      $timeout.cancel(opt.loadUserTimer);
      delete opt.loadUserTimer;
    }
    // Tạo Timer đếm ngược
    function handleCreateTimer() {
      vm.close_duration = Remaining.duration(vm.poll.close);
      vm.isClosed = moment(vm.poll.close).isBefore(new moment());
      if (!vm.isClosed) {
        vm.remaining = $timeout(handleCreateTimer, 1000);
      } else {
        $timeout.cancel(vm.remaining);
      }
    }
    // Lưu poll vào viewed và tăng lượt view
    function handleSaveViewed() {
      if (!vm.poll.isCurrentUserOwner) {
        var count_up = $timeout(() => {
          vm.poll.viewCnt += 1;
          Action.upViewPoll(vm.poll._id);
          if ($scope.isLogged) {
            Action.saveViewPoll(vm.view);
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
        Action.loadVotesByPollId(vm.poll._id)
          .then(res => { // lấy thông tin vote
            vm.chart.colors = [];
            vm.chart.labels = [];
            vm.chart.data = [];
            vm.votes = res.data || [];
            vm.voteopts = Action.getOptionsInVotes(vm.votes);
            vm.votedTotal = vm.voteopts.length;
            var collect = Action.countByOptions(vm.opts, vm.voteopts);

            vm.opts.forEach(opt => {
              opt.voteCnt = _.findWhere(collect, { opt: opt._id }).count;
              opt.progressVal = Action.calPercen(vm.votedTotal, opt.voteCnt);
              vm.chart.colors.push(opt.color);
              vm.chart.labels.push(opt.title);
              vm.chart.data.push(opt.voteCnt);
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
    vm.handleFollowPoll = () => {
      if (!$scope.isLogged) {
        $scope.handleShowMessage('MS_CM_LOGIN_ERROR', true);
        return;
      }
      Action.saveFollowPoll(vm.follow)
        .then(res => {
          if (res) {
            vm.follow = res;
          } else {
            vm.follow = { poll: vm.poll._id };
          }
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    };
    // Thành viên bấm report poll
    vm.handleReportPoll = () => {
      if (vm.reported) {
        $scope.handleShowMessageWithParam('MS_CM_REPORT_EXIST_ERROR', { title: vm.poll.title }, true);
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
        Action.saveReportPoll(vm.poll, reason)
          .then(res => {
            vm.reported = (res) ? true : false;
            $scope.handleShowMessageWithParam('MS_CM_REPORT_SUCCESS', { title: vm.poll.title }, false);
          })
          .catch(err => {
            $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
          });
      }
    };
    // Thành viên bấm add bookmart poll
    vm.handleBookmarkPoll = () => {
      if (vm.bookmarked) {
        $scope.handleShowMessageWithParam('MS_CM_BOOKMARK_EXIST_ERROR', { title: vm.poll.title }, true);
        return;
      }
      Action.saveBookmarkPoll(vm.poll._id)
        .then(res => {
          vm.bookmarked = (res) ? true : false;
          $scope.handleShowMessageWithParam('MS_CM_BOOKMARK_SUCCESS', { title: vm.poll.title }, false);
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    };

    // Click button add option
    vm.handleStartInputOption = handleStartInputOption;
    vm.isFocusOptionInput = false;
    function handleStartInputOption() {
      if (!vm.poll.user) {
        $scope.handleShowMessage('LB_POLLS_SUGGEST_DELETED_USER', true);
        return;
      }
      vm.tmp_opt = { poll: vm.poll._id, title: '', body: '', status: 2 };
      angular.element('body').toggleClass('aside-panel-open');
      vm.isFocusOptionInput = true;
    }
    // Click button save option
    vm.handleSaveOption = handleSaveOption;
    function handleSaveOption(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.optForm');
        return false;
      }
      vm.tmp_opt.isSuggest = true;
      Action.saveOption(vm.tmp_opt, vm.poll)
        .then(res => {
          $scope.$broadcast('show-errors-reset', 'vm.form.optForm');
          angular.element('body').removeClass('aside-panel-open');
          vm.isFocusOptionInput = false;
          $scope.handleShowMessage('LB_POLLS_SUGGEST_SUCCES', false);
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
          $scope.$broadcast('show-errors-reset', 'vm.form.optForm');
          angular.element('body').removeClass('aside-panel-open');
        });
    }
    vm.handleShowFullOption = handleShowFullOption;
    function handleShowFullOption() {
      let aside = angular.element('.aside-panel')[0];
      angular.element(aside).toggleClass('full');
      angular.element('#aside-panel-full-toggle').find('i').toggleClass('r180');
    }
    // Thành viên trả lời comment của thành viên khác
    vm.handleReplyComment = cmt => {
      if (!$scope.isLogged) {
        $scope.handleShowMessage('MS_CM_LOGIN_ERROR', true);
        return;
      }
      if (!cmt.user) {
        $scope.handleShowMessage('LB_POLLS_REPLY_DELETED_USER', true);
        return;
      }
      vm.tmp_cmt = {
        to: cmt.user,
        toName: cmt.user.displayName,
        toSlug: cmt.user.slug,
        discard: true
      };
      vm.cmt_typing = true;
    };
    // Thành viên chọn sửa comment của minh
    vm.handleEditComment = cmt => {
      vm.tmp_cmt = _.clone(cmt);
      vm.tmp_cmt.discard = true;
      vm.cmt_typing = true;
    };
    // Thành viên huỷ bỏ type comment
    vm.handleDiscardComment = () => {
      vm.tmp_cmt = {};
      vm.cmt_typing = false;
    };
    // Xóa comment
    vm.handleDeleteComment = cmt => {
      // Gọi function show dialog từ scope cha
      $scope.handleShowConfirm({
        content: 'LB_POLLS_CONFIRM_DELETE_CMT',
        type: 3,
        button: 'LB_DELETE'
      }, confirm => {
        vm.cmts = _.without(vm.cmts, cmt);
        vm.poll.cmtCnt -= 1;
        Action.deleteComment(cmt);
      });
    };
    // Bắt đầu nhập comment
    vm.handleStartTypeComment = () => {
      if (!$scope.isLogged) {
        $scope.handleShowMessage('MS_CM_LOGIN_ERROR', true);
        return;
      }
      vm.cmt_typing = true;
      let commentBox = angular.element(document.getElementById('comment-box'));
      $document.scrollToElementAnimated(commentBox, 100);
    };
    // Thành viên like comment
    vm.handleLikeComment = (cmt, type) => {
      if (!$scope.isLogged) {
        $scope.handleShowMessage('MS_CM_LOGIN_ERROR', true);
        return;
      }
      if ($scope.user._id === cmt.user._id) {
        $scope.handleShowMessage('LB_POLLS_LIKE_CMT_OWN', true);
        return;
      }
      if (vm.like_processing) {
        $scope.handleShowMessage('LB_POLLS_LIKE_MANY', true);
        return;
      }
      vm.like_processing = true;
      Action.saveLikeComment(cmt, type)
        .then(res => {
          cmt.like = res.like || {};
          cmt.likeCnt = res.likeCnt;
          vm.like_processing = false;
          if (!$scope.$$phase) $scope.$digest();
        })
        .catch(err => {
          vm.like_processing = false;
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    };

    // VOTE
    vm.handleChecked = (id) => {
      if (vm.poll.allow_multiple) {
        if (_.contains(vm.selectedOpts, id)) {
          vm.selectedOpts = _.without(vm.selectedOpts, id);
        } else {
          vm.selectedOpts.push(id);
        }
      } else {
        vm.selectedOpts = [vm.radioChecked];
      }
    };
    vm.isCanVote = () => {
      if (vm.poll.allow_guest) {
        return true;
      } else {
        return $scope.isLogged;
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
    vm.toggle_chart = () => {
      vm.chart.type = vm.chart.type === 'polarArea' ?
        'pie' : 'polarArea';
    };

    vm.task_queue = {
      is_watting: false,
      last_task_time: 0
    };
    vm.excute_timer = {};
    function excute_task() {
      var now = new Date().getTime();
      var dif = now - vm.task_queue.last_task_time;
      if (dif > 5000) {
        handleLoadNewVoteInfo()
          .then(() => {
            vm.task_queue.last_task_time = now;
            vm.task_queue.is_watting = false;
            $timeout.cancel(vm.excute_timer);
          })
          .catch(err => {
            vm.task_queue.last_task_time = now;
            vm.task_queue.is_watting = false;
            $timeout.cancel(vm.excute_timer);
          });
      } else {
        if (!vm.task_queue.is_watting) {
          vm.task_queue.is_watting = true;
          vm.excute_timer = $timeout(excute_task, (5000 - dif + 1000));
        }
      }
    }

  }
})();
