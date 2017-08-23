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
    'Notifications'
  ];

  function QuickPollController(
    $scope,
    $state,
    PollsService,
    Action,
    Notifications
  ) {
    var ctrl = this;
    ctrl.form = {};

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

  }
})();
