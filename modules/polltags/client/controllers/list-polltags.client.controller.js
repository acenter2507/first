(function () {
  'use strict';

  angular
    .module('polltags')
    .controller('PolltagsListController', PolltagsListController);

  PolltagsListController.$inject = ['PolltagsService'];

  function PolltagsListController(PolltagsService) {
    var vm = this;

    vm.polltags = PolltagsService.query();
  }
}());
