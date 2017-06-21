(function () {
  'use strict';

  angular
    .module('cmtlikes')
    .controller('CmtlikesListController', CmtlikesListController);

  CmtlikesListController.$inject = ['CmtlikesService'];

  function CmtlikesListController(CmtlikesService) {
    var vm = this;

    vm.cmtlikes = CmtlikesService.query();
  }
}());
