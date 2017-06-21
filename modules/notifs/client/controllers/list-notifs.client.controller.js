(function () {
  'use strict';

  angular
    .module('notifs')
    .controller('NotifsListController', NotifsListController);

  NotifsListController.$inject = ['NotifsService'];

  function NotifsListController(NotifsService) {
    var vm = this;

    vm.notifs = NotifsService.query();
  }
}());
