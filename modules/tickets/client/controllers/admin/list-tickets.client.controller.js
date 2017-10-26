'use strict';
angular.module('tickets.admin')
  .controller('AdminTicketListController', AdminTicketListController);
AdminTicketListController.$inject = ['$scope', '$filter', '$window', '$state', 'TicketsService', 'TicketsAdminService'];

function AdminTicketListController($scope, $filter, $window, $state, TicketsService, TicketsAdminService) {
  var vm = this;
  vm.tickets = [];
  vm.busy = true;
  vm.page = 1;
  vm.condition = {};
  vm.totalPage = 0;
  vm.totalUser = 0;
  vm.sort = '-created';

  onCreate();

  function onCreate() {
    getTickets();
  }
  /**
   * HANDLES
   */
  function getTickets() {
    TicketsAdminService.getTickets(vm.page, vm.condition)
      .success(res => {
        vm.tickets = res.docs;
        vm.totalPage = createArrayFromRange(res.pages);
        vm.totalUser = res.total;
        console.log(vm.tickets);
      })
      .error(err => {
        alert(err.message || err.data.message);
      });
  }

  vm.Search = () => {
    vm.page = 1;
    console.log(vm.condition);
    getTickets();
  };

  vm.ClearCondition = () => {
    vm.condition = {};
    vm.page = 1;
    getTickets();
  };

  vm.handleChangePage = page => {
    vm.page = page;
    getTickets();
  };

  $scope.remove = ticket => {
    if ($window.confirm('Delete this ticket?')) {
      ticket.$remove(function () {
        $state.go('admin.tickets.list');
      });
    }
  };

  function createArrayFromRange(range) {
    var array = [];
    for (var i = 1; i <= range; i++) {
      array.push(i);
    }
    return array;
  }
}
