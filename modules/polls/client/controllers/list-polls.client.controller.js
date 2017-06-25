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
    vm.new_data = [];
    vm.offset = 0;
    vm.loadPolls = loadOpts;
    init();

    function init() {
      loadPolls();
    }

    function loadPolls() {
      console.log('Start load poll');
      PollsApi.findPolls(vm.offset)
        .then(res => {
          vm.new_data = res.data || [];
          var promises = [];
          vm.new_data.forEach(poll => {
            poll.isCurrentUserOwner = (vm.isLogged && vm.authentication._id === poll.user._id);
            promises.push(loadPoll(poll));
          });
          return Promise.all(promises);
        })
        .then(res => {
          var promises = [];
          vm.new_data.forEach(poll => {
            promises.push(loadPolluser(poll));
          });
          return Promise.all(promises);
        })
        .then(res => {
          vm.polls = _.union(vm.polls, vm.new_data);
          vm.offset += vm.new_data.length;
          vm.new_data = [];
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

    function loadPolluser(poll) {
      return new Promise((resolve, reject) => {
        PollsApi.findPolluser(poll._id)
          .then(res => {
            poll.polluser = new Pollusers(res.data);
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
