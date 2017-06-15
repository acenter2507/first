(function() {
  'use strict';

  angular
    .module('opts')
    .controller('OptsListController', OptsListController);

  OptsListController.$inject = ['OptsService'];

  function OptsListController(OptsService) {
    console.log(OptsService);
    var vm = this;

    vm.opts = OptsService.query();
  }
}());
