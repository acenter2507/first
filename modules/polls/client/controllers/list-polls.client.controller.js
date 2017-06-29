(function() {
  'use strict';
  angular
    .module('polls')
    .controller('PollsListController', PollsListController);

  PollsListController.$inject = [
    '$scope',
    'Socket',
    'Authentication',
    'PollsService',
    'PollsApi',
    'PollusersService',
    'CategorysService'
  ];

  function PollsListController(
    $scope,
    Socket,
    Authentication,
    PollsService,
    PollsApi,
    Pollusers,
    Categorys
  ) {
    var vm = this;
    vm.authentication = Authentication;
    vm.isLogged = vm.authentication.user ? true : false;
    vm.polls = [];
    vm.hot_polls = [];
    vm.categorys = [];
    vm.new_data = [];
    vm.page = 0;
    vm.busy = false;
    vm.stopped = false;
    vm.loadPolls = loadPolls;
    init();

    function init() {
      initSocket();
      loadCategorys();
      // load Hot poll
      loadHotPolls();
    }

    function initSocket() {
      if (!Socket.socket) {
        Socket.connect();
      }
      Socket.emit('subscribe_public');
      Socket.on('poll_create', socketHandlePollCreate);
      $scope.$on('$destroy', function() {
        Socket.emit('unsubscribe_public');
        Socket.removeListener('poll_create');
      });
    }

    function loadPolls() {
      if (vm.stopped || vm.busy) return;
      vm.busy = true;
      PollsApi.findPolls(vm.page)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            vm.stopped = true;
            vm.busy = false;
            return;
          }
          // Load options và tính vote cho các opt trong polls
          vm.new_data = res.data || [];
          var promises = [];
          vm.new_data.forEach(poll => {
            poll.isCurrentUserOwner = vm.isLogged && vm.authentication._id === poll.user._id;
            poll.chart = {};
            poll.chart.options = { responsive: true };
            poll.chart.colors = [];
            poll.chart.labels = [];
            poll.chart.data = [];
            promises.push(loadPoll(poll));
          });
          return Promise.all(promises);
        })
        .then(res => {
          // Gán data vào list hiện tại
          vm.polls = _.union(vm.polls, vm.new_data);
          vm.page += 1;
          vm.busy = false;
          // Load polluser (Người dùng đã follow poll hay chưa)
          var promises = [];
          vm.new_data.forEach(poll => {
            promises.push(loadPolluser(poll));
          });
          return Promise.all(promises);
        })
        .then(res => {
          vm.new_data = [];
        })
        .catch(err => {
          vm.busy = false;
          vm.stopped = true;
          console.log(err);
        });
    }

    function loadHotPolls() {
      PollsApi.findHotPolls(0)
        .then(res => {
          vm.hot_polls = res.data || [];
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
              opt.voteCnt = _.where(poll.voteopts, { opt: opt._id }).length || 0;
              opt.progressVal = calPercen(poll.total, opt.voteCnt);
              poll.chart.data.push(opt.voteCnt);
              poll.chart.colors.push(opt.color);
              poll.chart.labels.push(opt.title);
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
        if (!vm.isLogged) {
          poll.polluser = new Pollusers();
          return resolve();
        }
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
    // Tính phần trăm tỉ lệ vote cho opt
    function calPercen(total, value) {
      if (total === 0) {
        return 0;
      }
      return Math.floor(value * 100 / total) || 0;
    }
    // Load Category cho màn hình chính
    function loadCategorys() {
      vm.categorys = Categorys.query();
    }

    function socketHandlePollCreate(res) {
      console.log('Has new poll');
    }
  }
})();
