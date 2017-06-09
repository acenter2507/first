(function () {
  'use strict';

  angular
    .module('polls')
    .controller('PollsListController', PollsListController);

  PollsListController.$inject = ['PollsService'];

  function PollsListController(PollsService) {
    var vm = this;

    vm.polls = PollsService.query();
  }
}());
