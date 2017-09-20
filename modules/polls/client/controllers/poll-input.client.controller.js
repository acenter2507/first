(function () {
  'use strict';
  // Polls controller
  angular
    .module('polls')
    .controller('PollInputController', PollInputController);

  PollInputController.$inject = [
    '$rootScope',
    '$scope',
    '$state',
    '$window',
    '$stateParams',
    'PollsService',
    'OptsService',
    'Socket',
    'Action',
    'ngDialog',
    'Notifications'
  ];

  function PollInputController(
    $rootScope,
    $scope,
    $state,
    $window,
    $stateParams,
    PollsService,
    Opts,
    Socket,
    Action,
    dialog,
    Notifications
  ) {
    var ctrl = this;

    analysic_poll();
    ctrl.form = {};

    function init() {
      ctrl.bk_poll = _.clone(ctrl.poll);
      ctrl.opts = ctrl.poll.opts || [];
      if (ctrl.poll._id) {
        ctrl.poll.close = ctrl.poll.close ? moment(ctrl.poll.close) : ctrl.poll.close;
        ctrl.isClosed = moment(ctrl.poll.close).isAfter(new moment());
        initSocket();
      }
      analysic_nofif();
    }

    // Get poll from param
    function analysic_poll() {
      if (!$stateParams.pollId) {
        ctrl.poll = new PollsService();
        init();
      } else {
        Action.get_poll($stateParams.pollId)
          .then(_poll => {
            ctrl.poll = _poll;
            init();
          });
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
    function analysic_nofif() {
      if ($stateParams.notif) {
        Notifications.markReadNotif($stateParams.notif);
      }
    }
    function isCanUpdate() {
      return true;
      // const update = moment(ctrl.poll.updated);
      // const now = moment(new Date());
      // var duration = moment.duration(now.diff(update)).asHours();
      // return duration >= 1;
    }
    // Function
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

    ctrl.save = isValid => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'ctrl.form.pollForm');
        return false;
      }

      if (!ctrl.validateCloseDate()) {
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
          handle_save();
        });
      } else {
        handle_save();
      }
      function handle_save() {
        ctrl.poll.opts = ctrl.opts;
        ctrl.poll.summary = 'summary';
        Action.save_poll(ctrl.poll)
          .then(res => {
            $state.go('polls.view', { pollId: res.slug });
          })
          .catch(err => {
            $scope.handleShowMessage(err.message, true);
          });
      }
    };

    ctrl.validateCloseDate = () => {
      if (!ctrl.poll.close) {
        return true;
      }
      return moment(ctrl.poll.close).isAfter(new moment());
    };
    ctrl.discard = () => {
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
    };
    function handle_discard() {
      if (ctrl.poll._id) {
        $state.go('polls.view', { pollId: ctrl.poll.slug });
      } else {
        $state.go('home');
      }
    }

    // OPTIONS
    ctrl.tmp_opt = {};
    ctrl.show_colorpicker = false;
    ctrl.input_opt = opt => {
      ctrl.tmp_opt = (opt) ? opt : { poll: ctrl.poll._id, title: '', body: '', status: 1 };
      angular.element('body').toggleClass('aside-panel-open');
    };
    ctrl.remove_opt = opt => {
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
    };
    ctrl.approve_opt = opt => {
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
    };
    ctrl.reject_opt = opt => {
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
    };
    ctrl.save_opt = isValid => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'ctrl.form.optForm');
        return false;
      }
      if (!ctrl.tmp_opt._id && !_.contains(ctrl.opts, ctrl.tmp_opt)) {
        ctrl.opts.push(_.clone(ctrl.tmp_opt));
      } else {
        ctrl.tmp_opt = {
          poll: ctrl.poll._id,
          title: ctrl.tmp_opt.title,
          body: ctrl.tmp_opt.body,
          color: ctrl.tmp_opt.color,
          status: 1
        };
      }
    };
    ctrl.opt_full = () => {
      let aside = angular.element('.aside-panel')[0];
      angular.element(aside).toggleClass('full');
      angular.element('#aside-panel-full-toggle').find('i').toggleClass('r180');
    };
    $scope.clear_close_date = () => {
      delete ctrl.poll.close;
    };
  }
})();
