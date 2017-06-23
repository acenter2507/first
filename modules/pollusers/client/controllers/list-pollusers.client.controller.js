(function () {
  'use strict';

  angular
    .module('pollusers')
    .controller('PollusersListController', PollusersListController);

  PollusersListController.$inject = ['PollusersService'];

  function PollusersListController(PollusersService) {
    var vm = this;

    vm.pollusers = PollusersService.query();
  }
}());
