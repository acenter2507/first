(function() {
  'use strict';
  angular
    .module('polls')
    .controller('PollsListController', PollsListController);

  PollsListController.$inject = ['PollsService', 'PollsApi'];

  function PollsListController(PollsService, PollsApi) {
    var vm = this;
    vm.polls = [];
    loadPolls();
    vm.progressVal = 57;
    vm.progressVal2 = 0;

    function loadPolls() {
      PollsService.query()
        .$promise.then(_polls => {
          vm.polls = _polls;
          var promises = [];
          vm.polls.forEach(poll => {
            promises.push(loadPoll(poll));
          });
          return Promise.all(promises);
        })
        .then(res => {
          console.log(res);
          console.log('load done');
        })
        .catch(err => {
          console.log(err);
        });
    }

    function loadPoll(poll) {
      return new Promise((resolve, reject) => {
        loadOpts(poll._id)
          .then(_opts => {
            poll.opts = _opts || [];
            return loadVoteopts(poll._id);
          })
          .then(res => {
            poll.votes = res.votes || [];
            poll.voteopts = res.voteopts || [];
            poll.total = poll.voteopts.length;
            poll.opts.forEach(opt => {
              opt.voteCnt =
                _.where(poll.voteopts, { opt: opt._id }).length || 0;
              opt.percent = calPercen(poll.total, opt.voteCnt);
            });
            return resolve(poll);
          })
          .catch(err => {
            return reject(err);
          });
      });
    }

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

    function loadVoteopts(pollId) {
      return new Promise((resolve, reject) => {
        PollsApi.findVoteopts(pollId)
          .then(res => {
            return resolve(res.data);
          })
          .catch(err => {
            return reject(err);
          });
      });
    }

    function calPercen(total, value) {
      return (value * 100) / total;
    }
  }
})();
