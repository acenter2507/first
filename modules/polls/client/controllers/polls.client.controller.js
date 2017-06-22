(function() {
  'use strict';

  // Polls controller
  angular
    .module('polls')
    .controller('PollsController', PollsController);

  PollsController.$inject = [
    '$scope',
    '$state',
    '$window',
    'Authentication',
    'pollResolve',
    'PollsApi',
    'TagsService',
    '$aside',
    'CmtsService',
    'VotesService',
    'VotesApi',
    'OptsService',
    'LikesService',
    'CmtsApi',
    'CmtlikesService',
    'Socket'
  ];

  function PollsController($scope, $state, $window, Authentication, poll, PollsApi, Tags, $aside, Cmts, Votes, VotesApi, Opts, Likes, CmtsApi, Cmtlikes, Socket) {
    var vm = this;
    vm.authentication = Authentication;
    vm.poll = poll;
    vm.poll.close = (vm.poll.close) ? moment(vm.poll.close) : vm.poll.close;
    vm.error = null;
    vm.form = {};
    vm.cmt_sorts = [
      { val: '-updated', name: 'Newest to oldest' },
      { val: 'updated', name: 'Oldest to newest' },
      { val: '-likeCnt', name: 'Most likes' }
    ];
    vm.cmt_sort = '-updated';

    vm.poll.tags = [];
    vm.like = {};
    vm.opts = [];
    vm.cmts = [];
    vm.votes = [];
    vm.voteopts = [];
    vm.votedTotal = 0;

    init();

    // Init data
    function init() {
      if (!vm.poll._id) {
        $state.go('polls.list');
      }
      // Get all Opts
      loadOpts();
      // Get all Cmts
      loadCmts();
      // Get all Tags
      loadTags();
      // Get like for this poll
      loadPollLike();
      // Init socket
      initSocket();
    }

    // Init data
    function initSocket() {
      if (!Socket.socket) {
        Socket.connect();
      }
      Socket.emit('subscribe', { pollId: vm.poll._id, userId: vm.authentication.user._id });
      Socket.on('comment', (cmtId) => {
        console.log("Has push comment");
        loadCmt(cmtId);
      });
      $scope.$on('$destroy', function() {
        Socket.emit('subscribe', { pollId: vm.poll._id, userId: vm.authentication.user._id });
      });
    }

    function isLogged() {
      if (vm.authentication.user) {
        return true;
      }
      return false;
    }

    function loadOpts() {
      PollsApi.findOpts(vm.poll._id)
        .then(res => {
          vm.opts = _.where(res.data, { status: 1 });
          loadVoteopts(vm.poll._id);
        })
        .catch(err => {
          alert('error' + err);
        });
    }

    function loadVoteopts() {
      PollsApi.findVoteopts(poll._id)
        .then(res => {
          vm.votes = res.data.votes || [];
          vm.voteopts = res.data.voteopts || [];
          vm.votedTotal = vm.voteopts.length;
          vm.opts.forEach(opt => {
            opt.voteCnt = _.where(vm.voteopts, { opt: opt._id }).length || 0;
          });
        })
        .catch(err => {
          alert('error' + err);
        });
    }

    function loadLikeCmt(cmt) {
      return new Promise((resolve, reject) => {
        CmtsApi.findLike(cmt._id)
          .then(res => {
            cmt.like = res.data || {};
            return resolve(cmt);
          })
          .catch(err => {
            return reject('error' + err);
          });
      });
    }

    function loadCmts() {
      // Get all Cmts
      return PollsApi.findCmts(vm.poll._id)
        .then(res => {
          vm.cmts = res.data;
          if (vm.authentication.user) {
            vm.cmts.forEach(cmt => {
              loadLikeCmt(cmt);
            });
          }
        })
        .catch(err => {
          alert('error' + err);
        });
    }

    function loadCmt(cmtId) {
      return Cmts.get({ cmtId: cmtId }).$promise
        .then(_cmt => {
          console.log('2', _cmt);
          return loadLikeCmt(_cmt);
        })
        .then(_cmt => {
          if (_.where(vm.cmts, _cmt).length > 0) {
            console.log('3', _cmt);
            _.extend(_.findWhere(vm.cmts, { _id: _cmt._id }), _cmt);
          } else {
            console.log('4', _cmt);
            vm.cmts.push(_cmt);
          }
        })
        .catch(err => {
          alert('error' + err);
        });
    }

    function loadTags() {
      PollsApi.findTags(poll._id)
        .then(res => {
          angular.forEach(res.data, (polltag, index) => {
            vm.poll.tags.push(polltag.tag);
          });
        })
        .catch(err => {
          alert('error' + err);
        });
    }

    function loadPollLike() {
      if (!vm.authentication.user) {
        vm.like = {};
        return false;
      }
      PollsApi.findPollLike(poll._id)
        .then(res => {
          vm.like = res.data || {};
        })
        .catch(err => {
          alert('error' + err);
        });
    }

    // Remove existing Poll
    vm.remove = () => {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.poll.$remove($state.go('polls.list'));
      }
    };

    // LIKES
    var liking = false;
    var cnt = 0;
    vm.like_poll = () => {
      if (!vm.authentication.user) {
        return alert('You must login to like this poll.');
      }
      if (vm.poll.isCurrentUserOwner) {
        return alert('You cannot like your poll.');
      }
      if (liking) {
        return alert('You cannot interact continuously.');
      }
      var _like;
      liking = true;
      var bk_like = vm.like;
      if (vm.like._id) {
        switch (vm.like.type) {
          case 0:
            cnt = 1;
            vm.like.type = 1;
            break;
          case 1:
            cnt = -1;
            vm.like.type = 0;
            break;
          case 2:
            cnt = 2;
            vm.like.type = 1;
            break;
        }
        vm.poll.likeCnt += cnt;
        _like = new Likes(vm.like);
        _like.cnt = cnt;
        _like.$update(successCallback, errorCallback);
      } else {
        cnt = 1;
        vm.poll.likeCnt += cnt;
        _like = new Likes({ poll: vm.poll._id, user: vm.authentication.user._id, type: 1 });
        _like.cnt = cnt;
        _like.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        vm.like = res.like;
        vm.poll.likeCnt = res.likeCnt;
        liking = false;
        console.log("liked");
      }

      function errorCallback(err) {
        vm.poll.likeCnt -= cnt;
        vm.like = bk_like;
        liking = false;
        console.log(err);
        //vm.error = res.data.message;
      }
    };

    vm.dislike_poll = () => {
      if (!vm.authentication.user) {
        return alert("You must login to dislike this poll.");
      }
      if (vm.poll.isCurrentUserOwner) {
        return alert('You cannot dislike your poll.');
      }
      if (liking) {
        return alert('You cannot interact continuously.');
      }
      var _dislike;
      liking = true;
      var bk_like = vm.like;
      if (vm.like._id) {
        switch (vm.like.type) {
          case 0:
            cnt = -1;
            vm.like.type = 2;
            break;
          case 1:
            cnt = -2;
            vm.like.type = 2;
            break;
          case 2:
            cnt = 1;
            vm.like.type = 0;
            break;
        }
        vm.poll.likeCnt += cnt;
        _dislike = new Likes(vm.like);
        _dislike.cnt = cnt;
        _dislike.$update(successCallback, errorCallback);
      } else {
        cnt = -1;
        vm.poll.likeCnt += cnt;
        _dislike = new Likes({ poll: vm.poll._id, user: vm.authentication.user._id, type: 2 });
        _dislike.cnt = cnt;
        _dislike.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        vm.like = res.like;
        vm.poll.likeCnt = res.likeCnt;
        liking = false;
        console.log("disliked");
      }

      function errorCallback(err) {
        vm.poll.likeCnt -= cnt;
        liking = false;
        vm.like = bk_like;
        console.log(err);
        //vm.error = res.data.message;
      }
    };

    // OPTIONS
    vm.option = {};
    var opt_aside = $aside({
      scope: $scope,
      controllerAs: vm,
      templateUrl: 'modules/polls/client/views/new-opt.client.view.html',
      title: vm.poll.title,
      placement: 'bottom',
      animation: 'am-fade-and-slide-bottom',
      show: false
    });
    // Click button add option
    vm.input_opt = (opt) => {
      vm.option = (!opt) ? new Opts({ poll: vm.poll._id, title: '', body: '', image: 'modules/opts/client/img/option.png', status: 2 }) : new Opts(opt);
      opt_aside.$promise.then(opt_aside.show);
    };
    // Click button save option
    vm.save_opt = (isValid) => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.optForm');
        return false;
      }
      vm.option.$save(successCallback, errorCallback);

      function successCallback(res) {
        opt_aside.$promise.then(opt_aside.hide);
        alert('Your option is waiting for approve. Thanks.');
      }

      function errorCallback(err) {
        console.log(err);
        //vm.error = res.data.message;
      }
    };

    // Comment
    var aside_cmt = $aside({
      scope: $scope,
      controllerAs: vm,
      templateUrl: 'modules/polls/client/views/new-cmt.client.view.html',
      title: vm.poll.title,
      placement: 'bottom',
      animation: 'am-fade-and-slide-bottom',
      show: false
    });
    vm.tmp_cmt = {};

    vm.aside_full_screen = () => {
      alert(1);
    };

    vm.input_cmt = (cmt) => {
      if (isLogged()) {
        vm.tmp_cmt = (!cmt) ? new Cmts({ poll: vm.poll._id, user: vm.authentication.user._id }) : new Cmts(cmt);
        aside_cmt.$promise.then(aside_cmt.show);
      } else {
        $state.go('authentication.signin');
      }
    };

    vm.save_cmt = (isValid) => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.cmtForm');
        return false;
      }
      if (!isLogged()) {
        $state.go('authentication.signin');
        return false;
      }
      var new_cmt = new Cmts(vm.tmp_cmt);
      if (vm.tmp_cmt._id) {
        new_cmt.isEdited = true;
        new_cmt.updated = new Date();
        new_cmt.$update(successCallback, errorCallback);
      } else {
        new_cmt.poll = vm.poll._id;
        new_cmt.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        Socket.emit('comment', { pollId: vm.poll._id, cmtId: res._id });
        vm.tmp_cmt = {};
      }

      function errorCallback(err) {
        alert(err.message);
        //vm.error = res.data.message;
      }
    };

    vm.reply_cmt = (cmt) => {
      alert('reply_cmt');
    };

    vm.edit_cmt = (cmt) => {
      vm.input_cmt(cmt);
    };

    vm.delete_cmt = (cmt) => {
      alert('delete_cmt');
    };

    vm.like_cmt = (cmt) => {
      if (!vm.authentication.user) {
        return alert('You must login to like this poll.');
      }
      if (vm.authentication.user._id === cmt.user._id) {
        return alert('You cannot like your comment.');
      }
      if (liking) {
        return alert('You cannot interact continuously.');
      }
      var _like;
      liking = true;
      var bk_like = cmt.like;
      if (cmt.like._id) {
        switch (cmt.like.type) {
          case 0:
            cnt = 1;
            cmt.like.type = 1;
            break;
          case 1:
            cnt = -1;
            cmt.like.type = 0;
            break;
          case 2:
            cnt = 2;
            cmt.like.type = 1;
            break;
        }
        cmt.likeCnt += cnt;
        _like = new Cmtlikes(cmt.like);
        _like.cnt = cnt;
        _like.$update(successCallback, errorCallback);
      } else {
        cnt = 1;
        cmt.likeCnt += cnt;
        _like = new Cmtlikes({ cmt: cmt._id, type: 1 });
        _like.cnt = cnt;
        _like.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        cmt.like = res.like;
        cmt.likeCnt = res.likeCnt;
        liking = false;
        console.log("liked");
      }

      function errorCallback(err) {
        cmt.likeCnt -= cnt;
        cmt.like = bk_like;
        liking = false;
        console.log(err);
        //vm.error = res.data.message;
      }
    };

    vm.dislike_cmt = (cmt) => {
      if (!vm.authentication.user) {
        return alert('You must login to dislike this poll.');
      }
      if (vm.authentication.user._id === cmt.user._id) {
        return alert('You cannot dislike your comment.');
      }
      if (liking) {
        return alert('You cannot interact continuously.');
      }

      var _dislike;
      liking = true;
      var bk_like = vm.like;
      if (cmt.like._id) {
        switch (cmt.like.type) {
          case 0:
            cnt = -1;
            cmt.like.type = 2;
            break;
          case 1:
            cnt = -2;
            cmt.like.type = 2;
            break;
          case 2:
            cnt = 1;
            cmt.like.type = 0;
            break;
        }
        cmt.likeCnt += cnt;
        _dislike = new Cmtlikes(cmt.like);
        _dislike.cnt = cnt;
        _dislike.$update(successCallback, errorCallback);
      } else {
        cnt = -1;
        cmt.likeCnt += cnt;
        _dislike = new Cmtlikes({ cmt: cmt._id, type: 2 });
        _dislike.cnt = cnt;
        _dislike.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        cmt.like = res.like;
        cmt.likeCnt = res.likeCnt;
        liking = false;
        console.log("liked");
      }

      function errorCallback(err) {
        cmt.likeCnt -= cnt;
        cmt.like = bk_like;
        liking = false;
        console.log(err);
      }
    };

    // VOTE
    if (vm.poll._id) {
      // Get Voted
      PollsApi.findOwnerVote(poll._id)
        .then(res => {
          if (res.data) {
            vm.ownVote = new Votes(res.data);
            return VotesApi.findOpts(vm.ownVote._id);
          } else {
            vm.ownVote = new Votes({ poll: vm.poll._id });
          }
        })
        .then(res => {
          vm.votedOpts = (res && res.data) ? _.pluck(res.data, 'opt') : [];
          vm.selectedOpts = (res && res.data) ? _.pluck(res.data, 'opt') : [];
        })
        .catch(err => {
          // alert('error' + err);
          console.log(err);
        });
    }

    vm.checked = function(id) {
      if (_.contains(vm.selectedOpts, id)) {
        vm.selectedOpts = _.without(vm.selectedOpts, id);
      } else {
        vm.selectedOpts.push(id);
      }
    };
    vm.is_voted = function(id) {
      return _.contains(vm.selectedOpts, id);
    };
    vm.voted_title = function() {
      return _.pluck(_.filter(vm.opts, function(opt) {
        return _.contains(vm.votedOpts, opt._id);
      }), 'title');
    };
    vm.save_vote = () => {
      if (!vm.authentication.user && !vm.poll.allow_guest) {
        return $state.go('authentication.signin');
      }
      if (!vm.selectedOpts.length || vm.selectedOpts.length === 0) {
        return alert('You must vote at least one option.');
      }
      vm.ownVote.opts = vm.selectedOpts;
      if (vm.ownVote._id) {
        vm.ownVote.updateCnt += 1;
        vm.ownVote.$update(successCallback, errorCallback);
      } else {
        vm.ownVote.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.reload();
      }

      function errorCallback(res) {
        vm.selectedOpts = angular.copy(vm.votedOpts) || [];
        alert('Vote failed');
      }
    };
  }
}());
