(function() {
  'use strict';

  // Polls controller
  angular
    .module('polls')
    .controller('PollInputController', PollInputController);

  PollInputController.$inject = [
    '$scope',
    '$state',
    '$window',
    'Authentication',
    'pollResolve',
    'PollsService',
    'PollsApi',
    'TagsService',
    '$aside',
    'OptsService',
    'Socket'
  ];

  function PollInputController($scope, $state, $window, Authentication, poll, Polls, PollsApi, Tags, $aside, Opts, Socket) {
    var vm = this;

    vm.authentication = Authentication;
    vm.poll = poll;
    vm.poll.close = (vm.poll.close) ? moment(vm.poll.close) : vm.poll.close;
    vm.poll.tags = [];
    vm.bk_poll = _.clone(poll);
    vm.error = null;
    vm.form = {};
    vm.opts = [];

    function init() {
      if (vm.poll._id) {
        loadOpts();
        loadTags();
        initSocket();
      }
    }

    init();
    // Init Socket
    function initSocket() {
      if (!Socket.socket) {
        Socket.connect();
      }
      Socket.emit('subscribe', { pollId: vm.poll._id, userId: vm.authentication.user._id });

      Socket.on('poll_delete', (res) => {
        alert('This poll has been deleted. Please back to list screen.');
        $state.go('poll.list');
      });
      Socket.on('poll_update', (res) => {
        console.log('poll_update');
        Polls.get({ pollId: vm.poll._id }, (_poll) => {
          vm.poll = _poll;
          vm.poll.close = (vm.poll.close) ? moment(vm.poll.close) : vm.poll.close;
          vm.poll.tags = [];
          loadOpts();
          loadTags();
        });
      });
      Socket.on('opts_update', (res) => {
        console.log('opts_update');
        loadOpts();
      });
      Socket.on('opts_request', (res) => {
        console.log('opts_request');
        loadOpts();
      });
      $scope.$on('$destroy', function() {
        Socket.emit('unsubscribe', { pollId: vm.poll._id, userId: vm.authentication.user._id });
        Socket.removeListener('poll_delete');
        Socket.removeListener('opts_request');
        Socket.removeListener('opts_update');
        Socket.removeListener('opts_request');
      });
    }

    function loadOpts() {
      PollsApi.findOpts(vm.poll._id)
        .then(res => {
          vm.opts = res.data || [];
        })
        .catch(err => {
          alert('error' + err);
        });
    }

    function loadTags() {
      PollsApi.findTags(vm.poll._id)
        .then(res => {
          angular.forEach(res.data, (polltag, index) => {
            vm.poll.tags.push(polltag.tag);
          });
        })
        .catch(err => {
          alert('error' + err);
        });
    }

    // Function
    vm.remove = () => {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.poll.$remove(() => {
          Socket.emit('poll_delete', { pollId: vm.poll._id });
          $state.go('polls.list');
        });
      }
    };

    vm.save = (isValid) => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.pollForm');
        return false;
      }
      var isNew = (!vm.poll._id) ? true : false;
      vm.poll.opts = vm.opts;
      if (vm.poll._id) {
        vm.poll.$update(successCallback, errorCallback);
      } else {
        vm.poll.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        if (isNew) {
          Socket.emit('poll_create');
        } else {
          Socket.emit('poll_update', { pollId: res._id });
        }
        $state.go('polls.view', {
          pollId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    };

    vm.discard = () => {
      if (angular.equals(vm.poll, vm.bk_poll)) {
        handle_discard();
      } else {
        if ($window.confirm('Are you sure you want to discard?')) {
          handle_discard();
        }
      }
    };
    // Back to before screen
    function handle_discard() {
      if (vm.poll._id) {
        $state.go('polls.view', { pollId: vm.poll._id });
      } else {
        $state.go('polls.list');
      }
    }

    // OPTIONS
    vm.option = {};
    var opt_aside = $aside({
      scope: $scope,
      controllerAs: vm,
      templateUrl: 'modules/polls/client/views/new-opt.client.view.html',
      title: vm.poll.title,
      placement: 'bottom',
      animation: 'am-fade-and-slide-bottom',
      show: false
    });
    vm.input_opt = (opt) => {
      vm.option = (!opt) ? { poll: vm.poll._id, title: '', body: '', image: 'modules/opts/client/img/option.png', status: 1 } : opt;
      opt_aside.$promise.then(opt_aside.show);
    };
    vm.remove_opt = (opt) => {
      if ($window.confirm('Are you sure you want to remove?')) {
        if (opt._id) {
          var _opt = new Opts(opt);
          _opt.$remove(() => {
            Socket.emit('opts_update', { pollId: vm.poll._id });
          });
        } else {
          vm.opts = _.without(vm.opts, opt);
        }
      }
    };
    vm.approve_opt = (opt) => {
      if ($window.confirm('Are you sure you want to approve?')) {
        opt.status = 1;
        var _opt = new Opts(opt);
        _opt.$update(() => {
          Socket.emit('opts_update', { pollId: vm.poll._id });
        });
      }
    };
    vm.reject_opt = (opt) => {
      if ($window.confirm('Are you sure you want to reject?')) {
        opt.status = 3;
        var _opt = new Opts(opt);
        _opt.$update(() => {
          Socket.emit('opts_update', { pollId: vm.poll._id });
        });
      }
    };
    vm.save_opt = (isValid) => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.optForm');
        return false;
      }
      if (!vm.option._id && !_.contains(vm.opts, vm.option)) {
        vm.opts.push(vm.option);
      }
      opt_aside.$promise.then(opt_aside.hide);
    };

    vm.aside_full_screen = () => {
      alert(1);
    };
  }
}());
