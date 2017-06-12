(function () {
  'use strict';

  angular
    .module('polls')
    .controller('PollsListController', PollsListController);

  PollsListController.$inject = ['PollsService'];

  function PollsListController(PollsService) {
    var vm = this;
    console.log(vm);

    vm.polls = PollsService.query();
  }
}());
