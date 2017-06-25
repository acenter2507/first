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

  function PollInputController(
    $scope,
    $state,
    $window,
    Authentication,
    poll,
    Polls,
    PollsApi,
    Tags,
    $aside,
    Opts,
    Socket
  ) {
    var vm = this;

    vm.authentication = Authentication;
    vm.poll = poll;
    vm.poll.close = vm.poll.close ? moment(vm.poll.close) : vm.poll.close;
    vm.poll.tags = [];
    vm.bk_poll = _.clone(poll);
    vm.error = null;
    vm.form = {};
    vm.opts = [];
    vm.classRandoms = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    vm.optClass = [];

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
      Socket.emit('subscribe', {
        pollId: vm.poll._id,
        userId: vm.authentication.user._id
      });

      Socket.on('poll_delete', res => {
        alert('This poll has been deleted. Please back to list screen.');
        $state.go('poll.list');
      });
      Socket.on('opts_request', res => {
        console.log('opts_request');
        loadOpts();
      });
      $scope.$on('$destroy', function() {
        Socket.emit('unsubscribe', {
          pollId: vm.poll._id,
          userId: vm.authentication.user._id
        });
        Socket.removeListener('poll_delete');
        Socket.removeListener('opts_request');
      });
    }

    function loadOpts() {
      PollsApi.findOpts(vm.poll._id)
        .then(res => {
          vm.opts = res.data || [];
          vm.opts.forEach(opt => {
            if (opt.status === 1 && !_.contains(vm.optClass, opt.class)) {
              vm.optClass.push(opt.class);
            }
          });
          console.log(vm.optClass);
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

    function isCanUpdate() {
      const update = moment(vm.poll.updated);
      const now = moment(new Date());
      var duration = moment.duration(now.diff(update)).asHours();
      return duration >= 1;
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

    vm.save = isValid => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.pollForm');
        return false;
      }
      var isNew = !vm.poll._id ? true : false;
      vm.poll.opts = vm.opts;
      if (vm.poll._id) {
        if (!isCanUpdate()) {
          return alert(
            'Bạn không thể update poll trong vòng một giờ kể từ lần update trước.'
          );
        }
        vm.poll.$update(successCallback, errorCallback);
      } else {
        vm.poll.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        if (isNew) {
          Socket.emit('poll_create');
        } else {
          Socket.emit('poll_update', { pollId: vm.poll._id });
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
    vm.tmp_opt = {};
    var opt_aside = $aside({
      scope: $scope,
      controllerAs: vm,
      templateUrl: 'modules/polls/client/views/new-opt.client.view.html',
      title: vm.poll.title,
      placement: 'bottom',
      animation: 'am-fade-and-slide-bottom',
      show: false
    });
    vm.input_opt = opt => {
      vm.tmp_opt = !opt
        ? {
          poll: vm.poll._id,
          title: '',
          body: '',
          image: 'modules/opts/client/img/option.png',
          status: 1
        }
        : opt;
      opt_aside.$promise.then(opt_aside.show);
    };
    vm.remove_opt = opt => {
      if ($window.confirm('Are you sure you want to remove?')) {
        if (opt._id) {
          var _opt = new Opts(opt);
          _opt.$remove(() => {
            Socket.emit('opts_update', { pollId: vm.poll._id });
            $state.reload();
          });
        } else {
          vm.opts = _.without(vm.opts, opt);
        }
      }
    };
    vm.approve_opt = opt => {
      if ($window.confirm('Are you sure you want to approve?')) {
        opt.status = 1;
        opt.class = randomClass();
        var _opt = new Opts(opt);
        _opt.$update(() => {
          Socket.emit('opts_update', { pollId: vm.poll._id });
          $state.reload();
        });
      }
    };
    vm.reject_opt = opt => {
      if ($window.confirm('Are you sure you want to reject?')) {
        opt.status = 3;
        var _opt = new Opts(opt);
        _opt.$update($state.reload());
      }
    };
    vm.save_opt = isValid => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.optForm');
        return false;
      }
      if (!vm.tmp_opt._id && !_.contains(vm.opts, vm.tmp_opt)) {
        vm.tmp_opt.class = randomClass();
        vm.opts.push(vm.tmp_opt);
      }
      opt_aside.$promise.then(opt_aside.hide);
    };

    vm.aside_full_screen = () => {
      alert(1);
    };

    function randomClass() {
      var optClass =
        'opt' +
        vm.classRandoms[Math.floor(Math.random() * vm.classRandoms.length)];
      if (!_.contains(vm.optClass, optClass)) {
        vm.optClass.push(optClass);
        return optClass;
      }
      return randomClass();
    }
  }
})();
