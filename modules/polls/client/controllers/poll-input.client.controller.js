(function () {
  'use strict';
  // Polls controller
  angular
    .module('polls')
    .controller('PollInputController', PollInputController)
    .controller('BottomSheetController', BottomSheetController);

  PollInputController.$inject = [
    '$rootScope',
    '$scope',
    '$state',
    '$window',
    'Authentication',
    'pollResolve',
    'notifResolve',
    'OptsService',
    'Socket',
    'CategorysService',
    'toastr',
    'Action',
    'ngDialog',
    '$mdBottomSheet'
  ];

  function PollInputController(
    $rootScope,
    $scope,
    $state,
    $window,
    Authentication,
    poll,
    notif,
    Opts,
    Socket,
    Categorys,
    toast,
    Action,
    dialog,
    $mdBottomSheet
  ) {
    var ctrl = this;

    ctrl.authentication = Authentication;
    ctrl.user = Authentication.user;
    ctrl.isLogged = (ctrl.user);
    ctrl.poll = poll;
    ctrl.poll.close = ctrl.poll.close ? moment(ctrl.poll.close) : ctrl.poll.close;
    ctrl.isClosed = moment(ctrl.poll.close).isAfter(new moment());
    Categorys.query().$promise.then(_ctgrs => {
      ctrl.categorys = _ctgrs;
    });

    ctrl.bk_poll = _.clone(poll);
    ctrl.form = {};
    ctrl.opts = ctrl.poll.opts || [];

    function init() {
      if (ctrl.poll._id) {
        initSocket();
      }
      analysic_nofif();
    }

    init();
    // Init Socket
    function initSocket() {
      if (!Socket.socket) {
        Socket.connect();
      }
      Socket.emit('subscribe_poll', {
        pollId: ctrl.poll._id,
        userId: ctrl.user._id
      });
      Socket.on('poll_delete', res => {
        toast.error('This poll has been deleted.', 'Error!');
        $state.go('polls.list');
      });
      Socket.on('opts_request', res => {
        console.log('Has option request');
        Action.get_poll(ctrl.poll._id)
          .then(_poll => {
            ctrl.poll = _poll;
            ctrl.opts = ctrl.poll.opts;
            $scope.$apply();
          }, err => {
            toast.error(err.message, 'Error!');
          });
      });
      $scope.$on('$destroy', function () {
        Socket.emit('unsubscribe', {
          pollId: ctrl.poll._id,
          userId: ctrl.user._id
        });
        Socket.removeListener('poll_delete');
        Socket.removeListener('opts_request');
      });
    }

    function analysic_nofif() {
      if (notif) {
        if (notif.status === 0) {
          notif.status = 1;
          notif.$update(() => {
            $rootScope.$emit('changeNotif');
          });
        }
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
      $scope.message_title = 'Delete poll!';
      $scope.message_content = 'Are you sure you want to delete?';
      $scope.dialog_type = 3;
      $scope.buton_label = 'Delete';
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

    ctrl.save = isValid => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'pollForm');
        return false;
      }

      if (!ctrl.validateBody() || !ctrl.validateCategory() || !ctrl.validateTitle() || !ctrl.validateCloseDate()) {
        toast.error('You have not entered enough information.', 'Error!');
        return;
      }
      if (!ctrl.poll.isPublic) {
        $scope.message_title = 'Save poll!';
        $scope.message_content = 'You want to save a private poll?';
        $scope.dialog_type = 1;
        $scope.buton_label = 'Save';
        dialog.openConfirm({
          scope: $scope,
          templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
        }).then(confirm => {
          handle_save();
        }, reject => {
        });
      } else {
        handle_save();
      }
      function handle_save() {
        ctrl.poll.opts = ctrl.opts;
        Action.save_poll(ctrl.poll)
          .then(res => {
            $state.go('polls.view', { pollId: res._id });
          })
          .catch(err => {
            toast.error(err.message, 'Error!');
          });
      }
    };

    ctrl.validateCategory = () => {
      return (ctrl.poll.category) ? true : false;
    };
    ctrl.validateTitle = () => {
      return (ctrl.poll.title) ? true : false;
    };
    ctrl.validateBody = () => {
      return (ctrl.poll.body) ? true : false;
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
        $scope.message_title = 'Discard poll!';
        $scope.message_content = 'Are you sure you want to discard?';
        $scope.dialog_type = 2;
        $scope.buton_label = 'Discard';
        dialog.openConfirm({
          scope: $scope,
          templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
        }).then(confirm => {
          handle_discard();
        }, reject => {
        });
      }
    };
    function handle_discard() {
      if (ctrl.poll._id) {
        $state.go('polls.view', { pollId: ctrl.poll._id });
      } else {
        $state.go('polls.list');
      }
    }

    // OPTIONS
    ctrl.tmp_opt = {};
    ctrl.show_colorpicker = false;
    ctrl.opt_class = opt => {
      var classStr = 'custom-panel ';
      classStr += opt.status === 1 ? 'public' : '';
      classStr += opt.status === 2 ? 'waiting' : '';
      return classStr;
    };
    ctrl.input_opt = opt => {
      if (opt) {
        ctrl.tmp_opt = opt;
      } else {
        if (!ctrl.tmp_opt) {
          ctrl.tmp_opt = { poll: ctrl.poll._id, title: '', body: '', status: 1 };
        }
      }
      $mdBottomSheet.show({
        templateUrl: 'modules/polls/client/views/new-opt.client.view.html',
        controller: 'BottomSheetController',
        escapeToClose: false,
        locals: {
          tmp_opt: ctrl.tmp_opt
        }
      }).then(function (clickedItem) {
        console.log(clickedItem);
      }).catch(function (error) {
        // User clicked outside or hit escape
      });
    };
    ctrl.remove_opt = opt => {
      $scope.message_title = 'Delete option!';
      $scope.message_content = 'Are you sure you want to delete this option?';
      $scope.dialog_type = 3;
      $scope.buton_label = 'Delete';
      dialog.openConfirm({
        scope: $scope,
        templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
      }).then(confirm => {
        handle_delete();
      }, reject => {
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
      $scope.message_title = 'Approve option!';
      $scope.message_content = 'Are you sure you want to approve this option?';
      $scope.dialog_type = 1;
      $scope.buton_label = 'Approve';
      dialog.openConfirm({
        scope: $scope,
        templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
      }).then(confirm => {
        handle_approve();
      }, reject => {
      });
      function handle_approve() {
        opt.status = 1;
        var _opt = new Opts(opt);
        _opt.$update(() => {
          Socket.emit('opts_update', { pollId: ctrl.poll._id });
        });
      }
    };
    ctrl.reject_opt = opt => {
      $scope.message_title = 'Reject option!';
      $scope.message_content = 'Are you sure you want to reject this option?';
      $scope.dialog_type = 2;
      $scope.buton_label = 'Reject';
      dialog.openConfirm({
        scope: $scope,
        templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
      }).then(confirm => {
        handle_reject();
      }, reject => {
      });
      function handle_reject() {
        opt.status = 3;
        var _opt = new Opts(opt);
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
        ctrl.opts.push(ctrl.tmp_opt);
        ctrl.tmp_opt = {};
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
  BottomSheetController.$inject = ['$scope', '$mdBottomSheet', 'tmp_opt'];
  function BottomSheetController($scope, $mdBottomSheet, tmp_opt) {
    $scope.dismiss = () => {
      $mdBottomSheet.hide();
    };
    $scope.save = () => {
      $mdBottomSheet.hide();
    };
    $scope.listItemClick = function ($index) {
      var clickedItem = $scope.items[$index];
      $mdBottomSheet.hide(clickedItem);
    };
  }
})();
