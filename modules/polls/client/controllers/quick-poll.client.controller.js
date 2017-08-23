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
    'Action',
    'Notifications',
    'Constants'
  ];

  function QuickPollController(
    $scope,
    $state,
    PollsService,
    Action,
    Notifications,
    Constants
  ) {
    var ctrl = this;
    ctrl.form = {};
    ctrl.poll = {
      opts: [{
        color: randomColor()
      }, {
        color: randomColor()
      }],
      category: ctrl.categorys[0]
    };

    ctrl.save = isValid => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'ctrl.form.pollForm');
        return false;
      }

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
      ctrl.poll.opts.push({
        color: randomColor()
      });
    };

    function randomColor() {
      var length = Constants.colors.length;
      var currentColors = _.pluck(ctrl.poll.opts, 'color');
      var color, index;
      do {
        var index = getRandomArbitrary(0, length);
        color = Constants.colors[index];
      } while (!_.contains(currentColors, color));
      return color;
    }
    function getRandomArbitrary(min, max) {
      return Math.random() * (max - min) + min;
    }

  }
})();
