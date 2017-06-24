(function() {
  'use strict';
  angular
    .module('polls')
    .controller('PollsListController', PollsListController);

  PollsListController.$inject = ['PollsService', 'PollsApi', 'progressBarManager'];

  function PollsListController(PollsService, PollsApi, progressBarManager) {
    var vm = this;
    vm.polls = PollsService.query();
    vm.bar = progressBarManager();
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
