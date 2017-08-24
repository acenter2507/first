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
    'toastr'
  ];

  function QuickPollController(
    $scope,
    $state,
    PollsService,
    Categorys,
    Action,
    Constants,
    toast
  ) {
    var ctrl = this;
    ctrl.categorys = Categorys.list;
    ctrl.message = '';
    ctrl.form = {};
    ctrl.poll = {
      opts: [{
        color: Constants.colors[15]
      }, {
        color: Constants.colors[40]
      }],
      category: ctrl.categorys[0]._id
    };

    ctrl.save = isValid => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'ctrl.form.pollForm');
        return false;
      }
      if (!validOptions()) {
        ctrl.message = 'Please check your options, has invalid info';
        return false;
      }
      var rs = new PollsService(ctrl.poll);
      Action.save_poll(rs)
        .then(res => {
          $state.go('polls.view', { pollId: res.slug });
          $scope.closeThisDialog();
        })
        .catch(err => {
          $scope.closeThisDialog();
          toast.error('There were problems creating your poll.', 'Error!');
        });
    };
    ctrl.add = () => {
      var color = randomColor();
      ctrl.poll.opts.push({
        color: color
      });
    };
    ctrl.remove = opt => {
      ctrl.poll.opts = _.without(ctrl.poll.opts, opt);
    };
    ctrl.write_as_post = () => {
      $scope.closeThisDialog();
      $state.go('polls.create');
    };
    ctrl.discard = () => {
      $scope.closeThisDialog();
    };

    function validOptions() {
      for (var index = 0; index < ctrl.poll.opts.length; index++) {
        var element = ctrl.poll.opts[index];
        if (!element.title || element.title === '' || element.color === '') {
          return false;
        }
      }
      return true;
    }
    function randomColor() {
      var length = Constants.colors.length;
      var currentColors = _.pluck(ctrl.poll.opts, 'color');
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
