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
    var vm = this;
    vm.form = {};
    // Biến tạm lưu option
    vm.tmp_opt = {};

    onPrepare();

    // Lấy id của poll trong đường dẫn để request API
    function onPrepare() {
      if (!$stateParams.pollId) {
        vm.poll = new PollsService();
        onCreate();
      } else {
        Action.loadPollById($stateParams.pollId).then(_poll => {
          vm.poll = _poll;
          onCreate();
        });
      }
    }

    function onCreate() {
      if (!vm.poll.isCurrentUserOwner && !$scope.isAdmin) {
        $state.go('home');
        $scope.handleShowMessage('MS_CM_AUTH_ERROR', true);
        return;
      }
      vm.bk_poll = _.clone(vm.poll);
      vm.opts = vm.poll.opts || [];
      if (vm.poll._id) {
        $scope.handleChangePageTitle(vm.poll.title);
        vm.poll.close = vm.poll.close ? moment(vm.poll.close).utc() : vm.poll.close;
        vm.isClosed = moment(vm.poll.close).utc().isAfter(new moment().utc());
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
        pollId: vm.poll._id,
        userId: $scope.user._id
      });
      Socket.on('poll_delete', res => {
        $scope.handleShowMessage('LB_POLLS_DELETED', true);
        $state.go('polls.list');
      });
      Socket.on('opts_request', res => {
        Opts.get({ optId: res }, _opt => {
          vm.opts.push(_opt);
        });
      });
      $scope.$on('$destroy', function () {
        Socket.emit('unsubscribe', {
          pollId: vm.poll._id,
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
    vm.handleSavePoll = isValid => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.pollForm');
        return false;
      }

      if (!handleValidateCloseDate()) {
        $scope.handleShowMessage('LB_POLLS_CLOSE_INVALID', true);
        return;
      }
      if (!vm.poll.isPublic) {
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
        vm.poll.opts = vm.opts;
        Action.savePoll(vm.poll)
          .then(res => {
            $state.go('polls.view', { pollId: res.slug });
          })
          .catch(err => {
            $scope.handleShowMessage(err.message, true);
          });
      }
    };
    // Hủy nhập poll
    vm.handleDiscard = handleDiscard;
    function handleDiscard() {
      if (angular.equals(vm.poll, vm.bk_poll)) {
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
        if (vm.poll._id) {
          $state.go('polls.view', { pollId: vm.poll.slug });
        } else {
          $state.go('home');
        }
      }
    }
    // Gọi màn hình nhập thông tin options
    vm.handleStartInputOption = handleStartInputOption;
    function handleStartInputOption(opt) {
      vm.tmp_opt = (opt) ? opt : { poll: vm.poll._id, title: '', body: '', status: 1 };
      angular.element('body').toggleClass('aside-panel-open');
    }
    // Xóa option
    vm.handleRemoveOption = handleRemoveOption;
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
        vm.opts = _.without(vm.opts, opt);
        if (opt._id) {
          var _opt = new Opts(opt);
          _opt.$remove(() => {
            Socket.emit('opts_update', { pollId: vm.poll._id });
          });
        }
      }
    }
    // Đồng ý đề xuất của thành viên
    vm.handleApproveOption = handleApproveOption;
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
          Socket.emit('opts_update', { pollId: vm.poll._id });
        });
      }
    }
    // Từ chối đề xuất
    vm.handleRejectOption = handleRejectOption;
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
    vm.handleSaveOption = handleSaveOption;
    function handleSaveOption(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.optForm');
        return false;
      }
      if (!vm.tmp_opt._id && !_.contains(vm.opts, vm.tmp_opt)) {
        vm.opts.push(_.clone(vm.tmp_opt));
      }
      vm.tmp_opt = {};
      $scope.$broadcast('show-errors-reset', 'vm.form.optForm');
      angular.element('body').removeClass('aside-panel-open');
    }
    // Hiển thị full màn hình
    vm.handleShowFullOption = handleShowFullOption;
    function handleShowFullOption() {
      let aside = angular.element('.aside-panel')[0];
      angular.element(aside).toggleClass('full');
      angular.element('#aside-panel-full-toggle').find('i').toggleClass('r180');
    }
    // Xóa thông tin cài đặt ngày close
    vm.handleClearCloseDate = handleClearCloseDate;
    function handleClearCloseDate() {
      delete vm.poll.close;
    }
    // Kiểm tra ngày đóng poll hợp lệ hay không
    function handleValidateCloseDate() {
      if (!vm.poll.close) return true;
      if (vm.poll._id && vm.isClosed) return true;
      return moment(vm.poll.close).utc().isAfter(new moment().utc());
    }
  }
})();
