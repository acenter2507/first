(function () {
  'use strict';
  // Polls controller
  angular
    .module('polls')
    .controller('PollInputController', PollInputController);

  PollInputController.$inject = [
    '$scope',
    '$state',
    '$stateParams',
    'PollsService',
    'OptsService',
    'Socket',
    'Action',
    'Notifications'
  ];

  function PollInputController(
    $scope,
    $state,
    $stateParams,
    PollsService,
    Opts,
    Socket,
    Action,
    Notifications
  ) {
    var ctrl = this;
    ctrl.form = {};
    // Biến tạm lưu option
    ctrl.tmp_opt = {};

    onPrepare();

    // Lấy id của poll trong đường dẫn để request API
    function onPrepare() {
      if (!$stateParams.pollId) {
        ctrl.poll = new PollsService();
        onCreate();
      } else {
        Action.get_poll($stateParams.pollId).then(_poll => {
          ctrl.poll = _poll;
          onCreate();
        });
      }
    }

    function onCreate() {
      if (!ctrl.isCurrentUserOwner && !$scope.isAdmin) {
        $state.go('home');
        $scope.handleShowMessage('MS_CM_AUTH_ERROR', true);
        return;
      }
      ctrl.bk_poll = _.clone(ctrl.poll);
      ctrl.opts = ctrl.poll.opts || [];
      if (ctrl.poll._id) {
        $scope.handleChangePageTitle(ctrl.poll.title);
        ctrl.poll.close = ctrl.poll.close ? moment(ctrl.poll.close).utc() : ctrl.poll.close;
        ctrl.isClosed = moment(ctrl.poll.close).utc().isAfter(new moment().utc());
        // Lắng nghe các request từ server socket
        prepareSocketListener();
      }
      // Kiểm tra thông báo
      prepareParamNotification();
    }

    /**
     * PREPARE
     */
    function prepareSocketListener() {
      if (!Socket.socket) {
        Socket.connect();
      }
      Socket.emit('subscribe_poll', {
        pollId: ctrl.poll._id,
        userId: $scope.user._id
      });
      Socket.on('poll_delete', res => {
        $scope.handleShowMessage('LB_POLLS_DELETED', true);
        $state.go('polls.list');
      });
      Socket.on('opts_request', res => {
        Opts.get({ optId: res }, _opt => {
          ctrl.opts.push(_opt);
        });
      });
      $scope.$on('$destroy', function () {
        Socket.emit('unsubscribe', {
          pollId: ctrl.poll._id,
          userId: $scope.user._id
        });
        Socket.removeListener('poll_delete');
        Socket.removeListener('opts_request');
      });
    }
    function prepareParamNotification() {
      if ($stateParams.notif) {
        Notifications.markReadNotif($stateParams.notif);
      }
    }

    /**
     * HANDLES
     */
    // Lưu poll
    ctrl.handleSavePoll = handleSavePoll;
    function handleSavePoll(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'ctrl.form.pollForm');
        return false;
      }

      if (!handleValidateCloseDate()) {
        $scope.handleShowMessage('LB_POLLS_CLOSE_INVALID', true);
        return;
      }
      if (!ctrl.poll.isPublic) {
        // Gọi function show dialog từ scope cha
        $scope.handleShowConfirm({
          content: 'LB_POLLS_PRIVATE_SAVE',
          type: 1,
          button: 'LB_SAVE'
        }, confirm => {
          handleSave();
        });
      } else {
        handleSave();
      }
      function handleSave() {
        ctrl.poll.opts = ctrl.opts;
        Action.save_poll(ctrl.poll)
          .then(res => {
            $state.go('polls.view', { pollId: res.slug });
          })
          .catch(err => {
            $scope.handleShowMessage(err.message, true);
          });
      }
    }
    // Hủy nhập poll
    ctrl.handleDiscard = handleDiscard;
    function handleDiscard() {
      if (angular.equals(ctrl.poll, ctrl.bk_poll)) {
        handle_discard();
      } else {
        // Gọi function show dialog từ scope cha
        $scope.handleShowConfirm({
          content: 'LB_POLLS_CONFIRM_DISCARD',
          type: 2,
          button: 'LB_DISCARD'
        }, confirm => {
          handle_discard();
        });
      }
      function handle_discard() {
        if (ctrl.poll._id) {
          $state.go('polls.view', { pollId: ctrl.poll.slug });
        } else {
          $state.go('home');
        }
      }
    }
    // Gọi màn hình nhập thông tin options
    ctrl.handleStartInputOption = handleStartInputOption;
    function handleStartInputOption(opt) {
      ctrl.tmp_opt = (opt) ? opt : { poll: ctrl.poll._id, title: '', body: '', status: 1 };
      angular.element('body').toggleClass('aside-panel-open');
    }
    // Xóa option
    ctrl.handleRemoveOption = handleRemoveOption;
    function handleRemoveOption(opt) {
      // Gọi function show dialog từ scope cha
      $scope.handleShowConfirm({
        content: 'LB_POLLS_CONFIRM_DELETE_OPT',
        type: 3,
        button: 'LB_DELETE'
      }, confirm => {
        handle_delete();
      });

      function handle_delete() {
        ctrl.opts = _.without(ctrl.opts, opt);
        if (opt._id) {
          var _opt = new Opts(opt);
          _opt.$remove(() => {
            Socket.emit('opts_update', { pollId: ctrl.poll._id });
          });
        }
      }
    }
    // Đồng ý đề xuất của thành viên
    ctrl.handleApproveOption = handleApproveOption;
    function handleApproveOption(opt) {
      // Gọi function show dialog từ scope cha
      $scope.handleShowConfirm({
        content: 'LB_POLLS_CONFIRM_APPROVE',
        type: 1,
        button: 'LB_APPROVE'
      }, confirm => {
        handle_approve();
      });
      function handle_approve() {
        opt.status = 1;
        var _opt = new Opts({ _id: opt._id, status: opt.status });
        _opt.$update(() => {
          Socket.emit('opts_update', { pollId: ctrl.poll._id });
        });
      }
    }
    // Từ chối đề xuất
    ctrl.handleRejectOption = handleRejectOption;
    function handleRejectOption(opt) {
      // Gọi function show dialog từ scope cha
      $scope.handleShowConfirm({
        content: 'LB_POLLS_CONFIRM_REJECT',
        type: 2,
        button: 'LB_REJECT'
      }, confirm => {
        handle_reject();
      });
      function handle_reject() {
        opt.status = 3;
        var _opt = new Opts({ _id: opt._id, status: opt.status });
        _opt.$update(() => {
        });
      }
    }
    // Lưu option
    ctrl.handleSaveOption = handleSaveOption;
    function handleSaveOption(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'ctrl.form.optForm');
        return false;
      }
      if (!ctrl.tmp_opt._id && !_.contains(ctrl.opts, ctrl.tmp_opt)) {
        ctrl.opts.push(_.clone(ctrl.tmp_opt));
      }
      ctrl.tmp_opt = {};
      $scope.$broadcast('show-errors-reset', 'ctrl.form.optForm');
      angular.element('body').removeClass('aside-panel-open');
    }
    // Hiển thị full màn hình
    ctrl.handleShowFullOption = handleShowFullOption;
    function handleShowFullOption() {
      let aside = angular.element('.aside-panel')[0];
      angular.element(aside).toggleClass('full');
      angular.element('#aside-panel-full-toggle').find('i').toggleClass('r180');
    }
    // Xóa thông tin cài đặt ngày close
    ctrl.handleClearCloseDate = handleClearCloseDate;
    function handleClearCloseDate() {
      delete ctrl.poll.close;
    }
    // Kiểm tra ngày đóng poll hợp lệ hay không
    function handleValidateCloseDate() {
      if (!ctrl.poll.close) return true;
      if (ctrl.poll._id && ctrl.isClosed) return true;
      return moment(ctrl.poll.close).utc().isAfter(new moment().utc());
    }
  }
})();
