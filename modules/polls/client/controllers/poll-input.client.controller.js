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
    'PollsApi',
    'TagsService',
    '$aside',
    'OptsService'
  ];

  function PollInputController($scope, $state, $window, Authentication, poll, PollsApi, Tags, $aside, Opts) {
    var vm = this;

    vm.authentication = Authentication;
    vm.poll = poll;
    vm.poll.close = (vm.poll.close) ? moment(vm.poll.close) : vm.poll.close;
    vm.poll.tags = [];
    vm.bk_poll = angular.copy(poll);
    vm.error = null;
    vm.form = {};

    vm.opts = [];

    if (vm.poll._id) {
      // Get all Opts
      PollsApi.findOpts(poll._id)
        .then(opts => {
          vm.opts = opts.data;
        })
        .catch(err => {
          alert('error' + err);
        });
      // Get all Tags
      PollsApi.findTags(poll._id)
        .then(polltags => {
          angular.forEach(polltags.data, (polltag, index) => {
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
        vm.poll.$remove($state.go('polls.list'));
      }
    };
    vm.save = (isValid) => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.pollForm');
        return false;
      }

      vm.poll.opts = vm.opts;
      if (vm.poll._id) {
        vm.poll.$update(successCallback, errorCallback);
      } else {
        vm.poll.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
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
    var opt_aside = $aside({
      scope: $scope,
      controllerAs: vm,
      templateUrl: 'modules/opts/client/views/new-opt-in-poll.client.view.html',
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
        var _opt = new Opts(opt);
        _opt.$remove($state.reload());
      }
    };
    vm.approve_opt = (opt) => {
      if ($window.confirm('Are you sure you want to approve?')) {
        opt.status = 1;
        var _opt = new Opts(opt);
        _opt.$update($state.reload());
      }
    };
    vm.reject_opt = (opt) => {
      if ($window.confirm('Are you sure you want to reject?')) {
        opt.status = 3;
        var _opt = new Opts(opt);
        _opt.$update($state.reload());
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
