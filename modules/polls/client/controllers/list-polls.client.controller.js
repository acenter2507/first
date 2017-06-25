(function() {
  'use strict';
  angular
    .module('polls')
    .controller('PollsListController', PollsListController);

  PollsListController.$inject = ['Authentication', 'PollsService', 'PollsApi', 'PollusersService', '$timeout'];

  function PollsListController(Authentication, PollsService, PollsApi, Pollusers, $timeout) {
    var vm = this;
    vm.authentication = Authentication;
    vm.isLogged = (vm.authentication.user) ? true : false;
    vm.polls = [];
    loadPolls();
    vm.progressVal = 57;
    vm.progressVal2 = 0;

    function loadPolls() {
      PollsService.query()
        .$promise.then(_polls => {
          console.log('Loaded info polls');
          vm.polls = _polls;
          var promises = [];
          vm.polls.forEach(poll => {
            promises.push(loadPoll(poll));
          });
          return Promise.all(promises);
        })
        .then(res => {
          console.log('Loaded info opts' ,res);
          promises = [];
          vm.polls.forEach(poll => {
            promises.push(loadPolluser(poll));
          });
          return $timeout(Promise.all(promises), 5000);
        })
        .then(res => {
          console.log('Loaded polluser' ,res);
        })
        .catch(err => {
          console.log(err);
        });
    }

    function loadPoll(poll) {
      return new Promise((resolve, reject) => {
        loadOpts(poll._id)
          .then(_opts => {
            poll.opts = _.where(_opts, { status: 1 }) || [];
            return loadVoteopts(poll._id);
          })
          .then(res => {
            poll.votes = res.votes || [];
            poll.voteopts = res.voteopts || [];
            poll.total = poll.voteopts.length;
            poll.opts.forEach(opt => {
              opt.voteCnt =
                _.where(poll.voteopts, { opt: opt._id }).length || 0;
              opt.progressVal = calPercen(poll.total, opt.voteCnt);
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

    function loadVoteopts(poll) {
      return new Promise((resolve, reject) => {
        PollsApi.findVoteopts(poll._id)
          .then(res => {
            poll.polluser = new Pollusers(res.data) || new Pollusers();
            return resolve(res.data);
          })
          .catch(err => {
            return reject(err);
          });
      });
    }

    function loadPolluser(pollId) {
      return new Promise((resolve, reject) => {
        PollsApi.findPolluser(pollId)
          .then(res => {
            return resolve(res.data);
          })
          .catch(err => {
            return reject(err);
          });
      });
    }
    function calPercen(total, value) {
      if (total === 0) {
        return 0;
      }
      return Math.floor(value * 100 / total) || 0;
    }

    // vm.drop_menu = poll => {
    //   if (vm.authentication.user && !poll.polluser._id) {
    //     loadPolluser(poll._id).then(_polluser => {
    //       poll.polluser = new Pollusers(_polluser) || poll.polluser;
    //       poll.following = (poll.polluser.following) ? 'Unfollow' : 'Follow';
    //     }, err => {
    //       alert(err + '');
    //     });
    //   }
    //   if (vm.authentication) {
    //      poll.isCurrentUserOwner = (poll.user._id === vm.authentication.user._id);
    //   }
    // };
  }
})();
