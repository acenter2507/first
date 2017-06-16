(function() {
  'use strict';

  // Polls controller
  angular
    .module('polls')
    .controller('PollsController', PollsController);

  PollsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'pollResolve', 'PollsApi', 'TagsService'];

  function PollsController($scope, $state, $window, Authentication, poll, PollsApi, Tags) {
    var vm = this;

    vm.authentication = Authentication;
    vm.poll = poll;
    vm.poll.close = (vm.poll.close) ? new Date(vm.poll.close) : vm.poll.close;
    vm.poll.tags = [];
    vm.bk_poll = angular.copy(poll);
    vm.close_min = new Date();
    vm.error = null;
    vm.form = {};

    if (vm.poll._id) {
      // Get all Opts
      PollsApi.findOpts(poll._id)
        .then(opts => {
          vm.opts = opts.data;
        })
        .catch(err => {
          alert('error' + err);
        });
      // Get all Cmts
      PollsApi.findCmts(poll._id)
        .then(cmts => {
          vm.cmts = cmts.data;
        })
        .catch(err => {
          alert('error' + err);
        });
      // Get all Cmts
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
    vm.remove = remove;
    vm.save = save;
    vm.discard = discard;
    vm.comment = comment;

    $scope.start = moment();
    $scope.end = moment().add(1, 'days').add(1, 'hours');

    $scope.presets = [{
      'name': 'This Week',
      'start': moment().startOf('week').startOf('day'),
      'end': moment().endOf('week').endOf('day'),
    }, {
      'name': 'This Month',
      'start': moment().startOf('month').startOf('day'),
      'end': moment().endOf('month').endOf('day'),
    }, {
      'name': 'This Year',
      'start': moment().startOf('year').startOf('day'),
      'end': moment().endOf('year').endOf('day'),
    }];
    $scope.changed = function() {
      console.log('changed start or end datetime objects');
    };
    $scope.changedStart = function() {
      console.log('changed start datetime object');
    };
    $scope.changedEnd = function() {
      console.log('changed end datetime object');
    };
    $scope.closed = function() {
      console.log('edit popover closed');
    };

    // Remove existing Poll
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.poll.$remove($state.go('polls.list'));
      }
    }

    // Save Poll
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.pollForm');
        return false;
      }
      // TODO: move create/update logic to service
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
    }

    // Discard edit or add poll
    function discard() {
      if (angular.equals(vm.poll, vm.bk_poll)) {
        handle_discard();
      } else {
        if ($window.confirm('Are you sure you want to discard?')) {
          handle_discard();
        }
      }
    }

    // Back to before screen
    function handle_discard() {
      if (vm.poll._id) {
        $state.go('polls.view', { pollId: vm.poll._id });
      } else {
        $state.go('polls.list');
      }
    }

    // Comment
    function comment() {
      if (vm.authentication.user) {
        alert('You can repply in this poll');
      } else {
        $state.go('authentication.signin');
      }
    }
  }
}());
