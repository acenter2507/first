(function () {
  'use strict';

  angular
    .module('pollreports')
    .controller('PollreportsListController', PollreportsListController);

  PollreportsListController.$inject = ['PollreportsService'];

  function PollreportsListController(PollreportsService) {
    var vm = this;

    vm.pollreports = PollreportsService.query();
  }
}());
