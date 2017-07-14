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
    'Authentication',
    'pollResolve',
    'notifResolve',
    '$bsModal',
    '$bsAside',
    'OptsService',
    'Socket',
    'CategorysService',
    'toastr',
    'Action',
    'ngDialog'
  ];

  function PollInputController(
    $rootScope,
    $scope,
    $state,
    $window,
    Authentication,
    poll,
    notif,
    $bsModal,
    $bsAside,
    Opts,
    Socket,
    Categorys,
    toast,
    Action,
    dialog
  ) {
    var vm = this;

    vm.authentication = Authentication;
    vm.isLogged = vm.authentication.user ? true : false;
    vm.poll = poll;
    vm.poll.close = vm.poll.close ? moment(vm.poll.close) : vm.poll.close;
    vm.isClosed = moment(vm.poll.close).isAfter(new moment());
    vm.poll.tags = [];
    vm.categorys = Categorys.query();
    vm.bk_poll = _.clone(poll);
    vm.form = {};
    vm.opts = [];

    vm.optionToggle = -1;

    $scope.sharedDate = new Date(new Date().setMinutes(0, 0));
    function init() {
      if (vm.poll._id) {
        initSocket();
        get_opts();
        get_tags();
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
        pollId: vm.poll._id,
        userId: vm.authentication.user._id
      });
      Socket.on('poll_delete', res => {
        toast.error('This poll has been deleted.', 'Error!');
        $state.go('polls.list');
      });
      Socket.on('opts_request', res => {
        get_opts();
      });
      $scope.$on('$destroy', function () {
        Socket.emit('unsubscribe', {
          pollId: vm.poll._id,
          userId: vm.authentication.user._id
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
    function get_opts() {
      Action.get_opts(vm.poll._id)
        .then(res => {
          vm.opts = res.data || [];
          $scope.$apply();
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    }

    function get_tags() {
      Action.get_tags(vm.poll._id)
        .then(res => {
          angular.forEach(res.data, (polltag, index) => {
            vm.poll.tags.push(polltag.tag);
          });
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    }

    function isCanUpdate() {
      return true;
      // const update = moment(vm.poll.updated);
      // const now = moment(new Date());
      // var duration = moment.duration(now.diff(update)).asHours();
      // return duration >= 1;
    }
    // Function
    vm.remove = () => {
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
        vm.poll.$remove(() => {
          Socket.emit('poll_delete', { pollId: vm.poll._id });
          $state.go('polls.list');
        });
      }
    };

    vm.save = () => {
      if (!vm.validateBody() || !vm.validateCategory() || !vm.validateTitle() || !vm.validateCloseDate()) {
        toast.error('You have not entered enough information.', 'Error!');
        return;
      }
      if (!vm.poll.isPublic) {
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
        vm.poll.opts = vm.opts;
        Action.save_poll(vm.poll)
          .then(res => {
            $state.go('polls.view', { pollId: res._id });
          })
          .catch(err => {
            toast.error(err.message, 'Error!');
          });
      }
    };

    vm.validateCategory = () => {
      return (vm.poll.category) ? true : false;
    };
    vm.validateTitle = () => {
      return (vm.poll.title) ? true : false;
    };
    vm.validateBody = () => {
      return (vm.poll.body) ? true : false;
    };
    vm.validateCloseDate = () => {
      if (!vm.poll.close) {
        return true;
      }
      return moment(vm.poll.close).isAfter(new moment());
    };
    vm.discard = () => {
      if (angular.equals(vm.poll, vm.bk_poll)) {
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
      if (vm.poll._id) {
        $state.go('polls.view', { pollId: vm.poll._id });
      } else {
        $state.go('polls.list');
      }
    }

    // OPTIONS
    vm.tmp_opt = {};
    vm.show_colorpicker = false;
    var opt_aside = $bsAside({
      scope: $scope,
      controllerAs: vm,
      templateUrl: 'modules/polls/client/views/new-opt.client.view.html',
      title: 'Add new option',
      placement: 'bottom',
      animation: 'am-fade-and-slide-bottom',
      show: false
    });
    vm.input_opt = opt => {
      vm.tmp_opt = (!opt) ? { poll: vm.poll._id, title: '', body: '', status: 1 } : opt;
      opt_aside.$promise.then(opt_aside.show);
    };
    vm.remove_opt = opt => {
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
        vm.opts = _.without(vm.opts, opt);
        if (opt._id) {
          var _opt = new Opts(opt);
          _opt.$remove(() => {
            Socket.emit('opts_update', { pollId: vm.poll._id });
          });
        }
      }
    };
    vm.approve_opt = opt => {
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
          Socket.emit('opts_update', { pollId: vm.poll._id });
          get_opts();
        });
      }
    };
    vm.reject_opt = opt => {
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
          get_opts();
        });
      }
    };
    vm.save_opt = isValid => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.optForm');
        return false;
      }
      if (!vm.tmp_opt._id && !_.contains(vm.opts, vm.tmp_opt)) {
        vm.opts.push(vm.tmp_opt);
      }
      opt_aside.$promise.then(opt_aside.hide);
    };
  }
})();
