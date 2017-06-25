(function() {
  'use strict';
  angular
    .module('polls')
    .controller('PollsListController', PollsListController);

  PollsListController.$inject = ['PollsService', 'PollsApi'];

  function PollsListController(PollsService, PollsApi) {
    var vm = this;
    vm.polls = PollsService.query();
    vm.progressVal = 57;
    vm.progressVal2 = 0;

    function loadOpts(pollID) {
      return new Promise((resolve, reject) => {
        PollsApi.findOpts(pollID)
          .then(res => {
            return resolve(res.data);
          })
          .catch(err => {
            return reject(err);
          });
      });
    }
  }
})();
