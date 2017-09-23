(function () {
  'use strict';

  // Tickets controller
  angular
    .module('tickets')
    .controller('TicketsController', TicketsController);

  TicketsController.$inject = ['$scope', '$state', '$window', 'ticketResolve', 'vcRecaptchaService', 'Constants'];

  function TicketsController ($scope, $state, $window, ticket, vcRecaptchaService, Constants) {
    var vm = this;

    vm.busy = false;
    vm.ticket = ticket;

    // Captcha
    $scope.reCaptcha = Constants.reCaptcha;
    $scope.response = null;
    $scope.widgetId = null;
    $scope.setResponse = function (response) {
      // console.info('Response available');
      $scope.response = response;
    };
    $scope.setWidgetId = function (widgetId) {
      // console.info('Created widget ID: %s', widgetId);
      $scope.widgetId = widgetId;
    };
    $scope.cbExpiration = function () {
      vcRecaptchaService.reload($scope.widgetId);
      $scope.response = null;
    };

    // Remove existing Ticket
    vm.remove = remove;
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.ticket.$remove($state.go('tickets.list'));
      }
    }

    // Save Ticket
    vm.save = save;
    function save(isValid) {
      if (vm.busy) return;
      vm.busy = true;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.ticketForm');
        vm.busy = false;
        return false;
      }

      vm.ticket.date = moment().utc();
      // TODO: move create/update logic to service
      if (vm.ticket._id) {
        vm.ticket.$update(successCallback, errorCallback);
      } else {
        vm.ticket.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        delete vm.ticket;
        vm.busy = false;
        $scope.handleShowMessage('LB_SUPPORT_SUCCESS', false);
      }

      function errorCallback(err) {
        vm.busy = false;
        $scope.handleShowMessage(err.message, true);
      }
    }
  }
}());
