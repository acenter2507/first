(function () {
  'use strict';

  angular
    .module('notifs')
    .controller('NotifsListController', NotifsListController);

  NotifsListController.$inject = ['NotifsService', '$filter'];

  function NotifsListController(NotifsService, $filter) {
    var vm = this;

  }
}());
