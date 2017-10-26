'use strict';
angular.module('tickets.admin')
  .controller('AdminTicketController', AdminTicketController);
AdminTicketController.$inject = ['$scope', '$filter', '$window', '$state', 'TicketsService' , 'TicketsAdminService', 'ticketResolve'];

function AdminTicketController($scope, $filter, $window, $state, TicketsService, TicketsAdminService , ticketResolve) {

  $scope.ticket = ticketResolve;
  $scope.busy = false;

  $scope.remove = () => {
    if ($window.confirm('Delete this ticket?')) {
      $scope.ticket.$remove(function () {
        $state.go('admin.tickets.list');
      });
    }
  };
 
  $scope.send = function (isValid) {

    $scope.busy = true;
    if (!isValid) {  
      $scope.$broadcast('show-errors-check-validity', 'ticketForm');
      $scope.busy = false;
      return false;
    }
    // TODO: move create/update logic to service
    if ($scope.ticket._id) {
      TicketsAdminService.send($scope.ticket._id,$scope.ticket.responseBody)
        .success(successCallback)
        .error(errorCallback);
    }
    function successCallback(res) {
      $scope.busy = false;
      $scope.$broadcast('show-errors-reset', 'form.ticketForm');
      $scope.handleShowMessage('Send email successfully', false);
      $scope.ticket.status = 0;
    }

    function errorCallback(err) {
      $scope.busy = false;
      $scope.handleShowMessage(err.message, true);
    }
  };
}
