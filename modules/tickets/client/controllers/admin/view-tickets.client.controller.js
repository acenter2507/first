'use strict';
angular.module('tickets.admin')
  .controller('AdminTicketViewController', AdminTicketViewController);
AdminTicketViewController.$inject = ['$scope', '$filter', '$window', '$state', 'TicketsService', 'ticketResolve'];

function AdminTicketViewController($scope, $filter, $window, $state, TicketsService, ticketResolve) {

  $scope.ticket = ticketResolve;

  $scope.remove = () => {
    if ($window.confirm('Delete this ticket?')) {
      $scope.ticket.$remove(function () {
        $state.go('admin.tickets.list');
      });
    }
  };
}
