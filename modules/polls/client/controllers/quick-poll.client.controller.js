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
    'Constants'
  ];

  function QuickPollController(
    $scope,
    $state,
    PollsService,
    Categorys,
    Action,
    Constants
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
      console.log(ctrl.poll);

      // if (!ctrl.poll.isPublic) {
      //   $scope.message_title = 'Save poll!';
      //   $scope.message_content = 'You want to save a private poll?';
      //   $scope.dialog_type = 1;
      //   $scope.buton_label = 'Save';
      //   dialog.openConfirm({
      //     scope: $scope,
      //     templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
      //   }).then(confirm => {
      //     handle_save();
      //   }, reject => {
      //   });
      // } else {
      //   handle_save();
      // }
      // function handle_save() {
      //   ctrl.poll.opts = ctrl.opts;
      //   Action.save_poll(ctrl.poll)
      //     .then(res => {
      //       $state.go('polls.view', { pollId: res.slug });
      //     })
      //     .catch(err => {
      //       toast.error(err.message, 'Error!');
      //     });
      // }
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
        if (element.title === '' || element.color === '') {
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
