(function () {
  'use strict';

  angular
    .module('views')
    .controller('ViewsListController', ViewsListController);

  ViewsListController.$inject = ['ViewsService'];

  function ViewsListController(ViewsService) {
    var vm = this;

    vm.views = ViewsService.query();
  }
}());
