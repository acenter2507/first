(function () {
  'use strict';
  // Polls controller
  angular
    .module('polls')
    .controller('QuickPollController', QuickPollController);

  QuickPollController.$inject = [
    '$scope',
    '$state',
    'PollsService',
    'Categorys',
    'Action',
    'Constants',
    'Storages',
    '$filter'
  ];

  function QuickPollController(
    $scope,
    $state,
    PollsService,
    Categorys,
    Action,
    Constants,
    Storages,
    $filter
  ) {
    var vm = this;
    vm.categorys = Categorys.list;
    vm.message = '';
    vm.form = {};
    vm.poll = {
      opts: [{
        color: Constants.colors[5]
      }, {
        color: Constants.colors[75]
      }],
      category: vm.categorys[0]._id
    };

    vm.save = isValid => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.pollForm');
        return false;
      }
      // if (!validOptions()) {
      //   vm.message = 'Please check your options, has invalid info';
      //   return false;
      // }
      vm.poll.opts = validOptions();
      //vm.poll.summary = vm.poll.body;
      var rs = new PollsService(vm.poll);
      Action.savePoll(rs)
        .then(res => {
          $state.go('polls.view', { pollId: res.slug });
          $scope.closeThisDialog();
        })
        .catch(err => {
          $scope.closeThisDialog();
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    };
    vm.add = () => {
      var color = randomColor();
      vm.poll.opts.push({
        color: color
      });
    };
    vm.remove = opt => {
      vm.poll.opts = _.without(vm.poll.opts, opt);
    };
    vm.write_as_post = () => {
      $scope.closeThisDialog();
      Storages.set_local(Constants.storages.draft_poll, JSON.stringify(vm.poll));
      $state.go('polls.create');
    };
    vm.discard = () => {
      $scope.closeThisDialog();
    };

    function validOptions() {
      var options = [];
      for (var index = 0; index < vm.poll.opts.length; index++) {
        var element = vm.poll.opts[index];
        if (element.title && element.title !== '' && element.color !== '') {
          options.push(element);
        }
      }
      return options;
    }
    function randomColor() {
      var length = Constants.colors.length;
      var currentColors = _.pluck(vm.poll.opts, 'color');
      var color, index;
      do {
        index = getRandomArbitrary(0, length);
        color = Constants.colors[index];
      } while (_.contains(currentColors, color));
      return color;
    }
    function getRandomArbitrary(min, max) {
      return Math.floor(Math.random() * (max - min) + min);
    }

  }
})();
