(function () {
  'use strict';

  angular
    .module('voteopts')
    .controller('VoteoptsListController', VoteoptsListController);

  VoteoptsListController.$inject = ['VoteoptsService'];

  function VoteoptsListController(VoteoptsService) {
    var vm = this;

    vm.voteopts = VoteoptsService.query();
  }
}());
