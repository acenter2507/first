(function () {
  'use strict';

  angular
    .module('cmts')
    .controller('CmtsListController', CmtsListController);

  CmtsListController.$inject = ['CmtsService'];

  function CmtsListController(CmtsService) {
    var vm = this;

    vm.cmts = CmtsService.query();
  }
}());
