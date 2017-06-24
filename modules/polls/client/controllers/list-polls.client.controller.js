(function() {
  'use strict';
  angular
    .module('polls')
    .controller('PollsListController', PollsListController);

  PollsListController.$inject = ['PollsService'];

  function PollsListController(PollsService) {
    var vm = this;
    vm.polls = PollsService.query();

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
