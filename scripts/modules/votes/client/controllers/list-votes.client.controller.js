(function () {
  'use strict';

  angular
    .module('votes')
    .controller('VotesListController', VotesListController);

  VotesListController.$inject = ['VotesService'];

  function VotesListController(VotesService) {
    var vm = this;

    vm.votes = VotesService.query();
  }
}());
