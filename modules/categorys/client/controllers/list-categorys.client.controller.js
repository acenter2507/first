(function () {
  'use strict';

  angular
    .module('categorys')
    .controller('CategorysListController', CategorysListController);

  CategorysListController.$inject = ['CategorysService'];

  function CategorysListController(CategorysService) {
    var vm = this;

    vm.categorys = CategorysService.query();
  }
}());
