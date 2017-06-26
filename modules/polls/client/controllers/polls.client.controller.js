(function() {
  'use strict';
  // Polls controller
  angular.module('polls').controller('PollsController', PollsController);

  PollsController.$inject = [
    '$scope',
    '$state',
    '$window',
    'Authentication',
    'pollResolve',
    'PollsService',
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
    'PollusersService',
    'Socket',
    '$mdDialog'
  ];

  function PollsController(
    $scope,
    $state,
    $window,
    Authentication,
    poll,
    Polls,
    PollsApi,
    Tags,
    $aside,
    Cmts,
    Votes,
    VotesApi,
    Opts,
    Likes,
    CmtsApi,
    Cmtlikes,
    Pollusers,
    Socket,
    $mdDialog
  ) {
    var vm = this;
    vm.authentication = Authentication;
    vm.isLogged = vm.authentication.user ? true : false;
    vm.poll = poll;
    vm.poll.close = vm.poll.close ? moment(vm.poll.close) : vm.poll.close;
    vm.form = {};
    vm.cmt_sorts = [
      { val: '-updated', name: 'Newest to oldest' },
      { val: 'updated', name: 'Oldest to newest' },
      { val: '-likeCnt', name: 'Most likes' }
    ];
    vm.cmt_sort = '-updated';
    vm.enter_send = false;

    vm.poll.tags = [];
    vm.like = {};
    vm.polluser = {};
    vm.opts = [];
    vm.cmts = [];
    vm.votes = [];
    vm.voteopts = [];
    vm.chart = {};
    vm.chart.options = {};
    vm.votedTotal = 0;
    vm.error = null;

    vm.cmt_processing = false;
    vm.cmt_typing = false;
    vm.tmp_cmt = {};
    vm.tmp_opt = {};
    vm.like_processing = false;
    var opt_aside = $aside({
      scope: $scope,
      controllerAs: vm,
      templateUrl: 'modules/polls/client/views/new-opt.client.view.html',
      title: vm.poll.title,
      placement: 'bottom',
      animation: 'am-fade-and-slide-bottom',
      show: false
    });

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
      // Load owner vote
      loadOwnerVote();
      // load following info
      if (vm.isLogged) {
        loadPolluser();
      }
      // Init socket
      initSocket();
    }

    // Init Socket
    function initSocket() {
      if (!Socket.socket) {
        Socket.connect();
      }
      Socket.emit('subscribe', {
        pollId: vm.poll._id,
        userId: vm.authentication.user._id
      });
      Socket.on('cmt_add', cmtId => {
        loadCmt(cmtId).then(
          _cmt => {
            console.log('Has new comment from: ' + _cmt.user.displayName);
          },
          err => {
            console.log('Has new comment but error: ' + err);
          }
        );
      });
      Socket.on('cmt_del', cmtId => {
        vm.cmts = _.without(
          vm.cmts,
          _.findWhere(vm.cmts, {
            _id: cmtId
          })
        );
      });
      Socket.on('poll_like', likeCnt => {
        // Update poll like
        vm.poll.likeCnt = likeCnt;
      });
      Socket.on('cmt_like', res => {
        var _cmt = _.find(vm.cmts, cmt => {
          return cmt._id === res.cmtId;
        });
        if (_cmt) {
          _cmt.likeCnt = res.likeCnt;
        }
      });
      Socket.on('poll_vote', res => {
        loadVoteopts(vm.poll._id);
      });
      Socket.on('poll_delete', res => {
        alert(
          'This poll has been deleted by owner. Please back to list screen.'
        );
        $state.go('poll.list');
      });
      Socket.on('poll_update', res => {
        Polls.get({ pollId: vm.poll._id }, _poll => {
          vm.poll = _poll;
          vm.poll.close = vm.poll.close ? moment(vm.poll.close) : vm.poll.close;
          vm.poll.tags = [];
          loadOpts();
          loadTags();
        });
      });
      Socket.on('opts_update', res => {
        loadOpts();
      });
      $scope.$on('$destroy', function() {
        Socket.emit('unsubscribe', {
          pollId: vm.poll._id,
          userId: vm.authentication.user._id
        });
        Socket.removeListener('cmt_add');
        Socket.removeListener('cmt_del');
        Socket.removeListener('poll_like');
        Socket.removeListener('cmt_like');
        Socket.removeListener('poll_vote');
        Socket.removeListener('poll_delete');
        Socket.removeListener('poll_update');
        Socket.removeListener('opts_update');
      });
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

    function loadVoteopts(pollId) {
      PollsApi.findVoteopts(pollId)
        .then(res => {
          vm.votes = res.data.votes || [];
          vm.voteopts = res.data.voteopts || [];
          vm.votedTotal = vm.voteopts.length;
          vm.chart.colors = [];
          vm.chart.labels = [];
          vm.chart.data = [];
          vm.opts.forEach(opt => {
            opt.voteCnt = _.where(vm.voteopts, { opt: opt._id }).length || 0;
            opt.progressVal = calPercen(vm.votedTotal, opt.voteCnt);
            vm.chart.colors.push(opt.color);
            vm.chart.labels.push(opt.title);
            vm.chart.data.push(opt.voteCnt);
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
      return new Promise((resolve, reject) => {
        Cmts.get({ cmtId: cmtId })
          .$promise.then(_cmt => {
            return loadLikeCmt(_cmt);
          })
          .then(_cmt => {
            if (_.where(vm.cmts, _cmt).length > 0) {
              _.extend(_.findWhere(vm.cmts, { _id: _cmt._id }), _cmt);
            } else {
              vm.cmts.push(_cmt);
            }
            resolve(_cmt);
          })
          .catch(err => {
            reject(err);
          });
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

    function loadOwnerVote() {
      return new Promise((resolve, reject) => {
        PollsApi.findOwnerVote(poll._id)
          .then(res => {
            vm.ownVote = res && res.data ? new Votes(res.data) : new Votes({ poll: vm.poll._id });
            return vm.ownVote._id ? loadVoteoopts(vm.ownVote._id) : resolve();
          })
          .then(res => {
            vm.votedOpts = res && res.data ? _.pluck(res.data, 'opt') : [];
            vm.selectedOpts = res && res.data ? _.pluck(res.data, 'opt') : [];
            return resolve();
          })
          .catch(err => {
            console.log(err);
            return reject();
          });
      });
    }

    function loadVoteoopts(voteId) {
      return new Promise((resolve, reject) => {
        VotesApi.findOpts(vm.ownVote._id)
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
    }

    function loadPolluser() {
      return new Promise((resolve, reject) => {
        PollsApi.findPolluser(vm.poll._id)
          .then(res => {
            vm.polluser = new Pollusers(res.data) || new Pollusers();
            return resolve(res);
          })
          .catch(err => {
            alert(err + '');
            return reject(err);
          });
      });
    }
    // Thao tác databse
    function save_cmt() {
      if (
        !vm.tmp_cmt.body ||
        !vm.tmp_cmt.body.length ||
        vm.tmp_cmt.body.length === 0
      ) {
        return alert('You must type something to reply.');
      }
      if (!vm.isLogged) {
        $state.go('authentication.signin');
        return false;
      }
      if (vm.cmt_processing) {
        return alert('Please wait until all comment be submit.');
      }
      vm.cmt_processing = true;
      var rs_cmt = new Cmts(vm.tmp_cmt);
      var isNew = !vm.tmp_cmt._id ? true : false;
      if (vm.tmp_cmt._id) {
        rs_cmt.isEdited = true;
        rs_cmt.updated = new Date();
        rs_cmt.$update(successCallback, errorCallback);
      } else {
        rs_cmt.poll = vm.poll._id;
        rs_cmt.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        Socket.emit('cmt_add', {
          pollId: vm.poll._id,
          cmtId: res._id,
          isNew: isNew,
          from: vm.authentication.user._id,
          to: res.to
        });
        vm.tmp_cmt = {};
        vm.cmt_processing = false;
        vm.cmt_typing = false;
      }

      function errorCallback(err) {
        alert('' + err);
        vm.cmt_processing = false;

        //vm.error = res.data.message;
      }
    }

    function save_vote() {
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
        vm.ownVote = res;
        Socket.emit('poll_vote', { pollId: vm.poll._id });
      }

      function errorCallback(res) {
        vm.selectedOpts = angular.copy(vm.votedOpts) || [];
        alert('Vote failed');
      }
    }

    // Tính phần trăm tỉ lệ vote cho opt
    function calPercen(total, value) {
      if (total === 0) {
        return 0;
      }
      return Math.floor(value * 100 / total) || 0;
    }

    // Remove existing Poll
    vm.remove = () => {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.poll.$remove(() => {
          Socket.emit('poll_delete');
          $state.go('polls.list');
        });
      }
    };

    // LIKES
    var cnt = 0;
    vm.like_poll = () => {
      if (!vm.authentication.user) {
        return alert('You must login to like this poll.');
      }
      if (vm.poll.isCurrentUserOwner) {
        return alert('You cannot like your poll.');
      }
      if (vm.like_processing) {
        return alert('You cannot interact continuously.');
      }
      var rs_like;
      vm.like_processing = true;
      var bk_like = _.clone(vm.like);
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
        rs_like = new Likes(vm.like);
        rs_like.cnt = cnt;
        rs_like.$update(successCallback, errorCallback);
      } else {
        cnt = 1;
        vm.poll.likeCnt += cnt;
        rs_like = new Likes({
          poll: vm.poll._id,
          user: vm.authentication.user._id,
          type: 1
        });
        rs_like.cnt = cnt;
        rs_like.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        vm.like = res.like;
        Socket.emit('poll_like', {
          pollId: vm.poll._id,
          likeCnt: res.likeCnt,
          from: vm.authentication.user._id,
          to: vm.poll.user._id,
          type: res.like.type
        });
        vm.like_processing = false;
        bk_like = null;
        cnt = 0;
      }

      function errorCallback(err) {
        vm.poll.likeCnt -= cnt;
        vm.like = _.clone(bk_like);
        vm.like_processing = false;
        bk_like = null;
        cnt = 0;
        console.log(err);
      }
    };

    vm.dislike_poll = () => {
      if (!vm.authentication.user) {
        return alert('You must login to dislike this poll.');
      }
      if (vm.poll.isCurrentUserOwner) {
        return alert('You cannot dislike your poll.');
      }
      if (vm.like_processing) {
        return alert('You cannot interact continuously.');
      }
      var rs_dislike;
      vm.like_processing = true;
      var bk_like = _.clone(vm.like);
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
        rs_dislike = new Likes(vm.like);
        rs_dislike.cnt = cnt;
        rs_dislike.$update(successCallback, errorCallback);
      } else {
        cnt = -1;
        vm.poll.likeCnt += cnt;
        rs_dislike = new Likes({
          poll: vm.poll._id,
          user: vm.authentication.user._id,
          type: 2
        });
        rs_dislike.cnt = cnt;
        rs_dislike.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        vm.like = res.like;
        Socket.emit('poll_like', {
          pollId: vm.poll._id,
          likeCnt: res.likeCnt,
          from: vm.authentication.user._id,
          to: vm.poll.user._id,
          type: res.like.type
        });
        vm.like_processing = false;
        bk_like = null;
        cnt = 0;
      }

      function errorCallback(err) {
        vm.poll.likeCnt -= cnt;
        vm.like = _.clone(bk_like);
        bk_like = null;
        cnt = 0;
        vm.like_processing = false;
        console.log(err);
      }
    };

    vm.follow_poll = () => {
      if (!vm.isLogged) {
        return alert('You must login to dislike this poll.');
      }
      if (vm.polluser._id) {
        vm.polluser.following = !vm.polluser.following;
        vm.polluser.$update(successCallback, errorCallback);
      } else {
        vm.polluser.poll = vm.poll._id;
        vm.polluser.user = vm.authentication.user._id;
        vm.polluser.following = true;
        vm.polluser.$save(successCallback, errorCallback);
      }
      function successCallback(res) {}

      function errorCallback(err) {
        vm.polluser.following = !vm.polluser.following;
        alert('following success:' + err);
      }
    };

    // OPTIONS
    // Click button add option
    vm.input_opt = opt => {
      vm.tmp_opt = (!opt) ? new Opts({ poll: vm.poll._id, title: '', body: '', image: 'modules/opts/client/img/option.png', status: 2 }) : new Opts(opt);
      opt_aside.$promise.then(opt_aside.show);
    };
    // Click button save option
    vm.save_opt = isValid => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.optForm');
        return false;
      }
      vm.tmp_opt.$save(successCallback, errorCallback);

      function successCallback(res) {
        opt_aside.$promise.then(opt_aside.hide);
        Socket.emit('opts_request', { pollId: vm.poll._id });
        alert('Your option is waiting for approve. Thanks.');
      }

      function errorCallback(err) {
        console.log(err);

        //vm.error = res.data.message;
      }
    };

    // Comment
    vm.aside_full_screen = () => {
      alert(1);
    };

    vm.save_cmt = save_cmt;

    vm.reply_cmt = cmt => {
      if (!vm.isLogged) {
        return alert('You must login to reply this comment.');
      }
      vm.tmp_cmt = {};
      vm.tmp_cmt.to = cmt.user._id;
      vm.tmp_cmt.toName = cmt.user.displayName;
      vm.tmp_cmt.discard = true;
      vm.cmt_typing = true;
    };

    vm.edit_cmt = cmt => {
      vm.tmp_cmt = _.clone(cmt);
      vm.tmp_cmt.discard = true;
      vm.cmt_typing = true;
    };

    vm.discard_cmt = () => {
      vm.tmp_cmt = {};
      vm.cmt_typing = false;
    };

    vm.delete_cmt = cmt => {
      if (confirm('Do you want to delete this comment ?')) {
        var rs_cmt = new Cmts(cmt);
        rs_cmt.$remove(() => {
          Socket.emit('cmt_del', { pollId: vm.poll._id, cmtId: cmt._id });
        });
      }
    };

    vm.focus_cmt = () => {
      vm.cmt_typing = true;
    };

    vm.like_cmt = cmt => {
      if (!vm.authentication.user) {
        return alert('You must login to like this poll.');
      }
      if (vm.authentication.user._id === cmt.user._id) {
        return alert('You cannot like your comment.');
      }
      if (vm.like_processing) {
        return alert('You cannot interact continuously.');
      }
      var rs_like;
      vm.like_processing = true;
      var bk_like = _.clone(cmt.like);
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
        rs_like = new Cmtlikes(cmt.like);
        rs_like.cnt = cnt;
        rs_like.$update(successCallback, errorCallback);
      } else {
        cnt = 1;
        cmt.likeCnt += cnt;
        rs_like = new Cmtlikes({ cmt: cmt._id, type: 1 });
        rs_like.cnt = cnt;
        rs_like.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        cmt.like = res.like;
        Socket.emit('cmt_like', {
          pollId: vm.poll._id,
          cmtId: cmt._id,
          likeCnt: res.likeCnt,
          from: vm.authentication.user._id,
          to: cmt.user._id,
          type: res.like.type
        });
        vm.like_processing = false;
        bk_like = null;
        cnt = 0;
        console.log('liked');
      }

      function errorCallback(err) {
        cmt.likeCnt -= cnt;
        cmt.like = _.clone(bk_like);
        vm.like_processing = false;
        bk_like = null;
        cnt = 0;
        console.log(err);
      }
    };

    vm.dislike_cmt = cmt => {
      if (!vm.authentication.user) {
        return alert('You must login to dislike this poll.');
      }
      if (vm.authentication.user._id === cmt.user._id) {
        return alert('You cannot dislike your comment.');
      }
      if (vm.like_processing) {
        return alert('You cannot interact continuously.');
      }

      var rs_dislike;
      vm.like_processing = true;
      var bk_like = _.clone(cmt.like);
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
        rs_dislike = new Cmtlikes(cmt.like);
        rs_dislike.cnt = cnt;
        rs_dislike.$update(successCallback, errorCallback);
      } else {
        cnt = -1;
        cmt.likeCnt += cnt;
        rs_dislike = new Cmtlikes({ cmt: cmt._id, type: 2 });
        rs_dislike.cnt = cnt;
        rs_dislike.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        cmt.like = res.like;
        Socket.emit('cmt_like', {
          pollId: vm.poll._id,
          cmtId: cmt._id,
          likeCnt: res.likeCnt,
          from: vm.authentication.user._id,
          to: cmt.user._id,
          type: res.like.type
        });
        vm.like_processing = false;
        bk_like = null;
        cnt = 0;
        console.log('liked');
      }

      function errorCallback(err) {
        cmt.likeCnt -= cnt;
        cmt.like = _.clone(bk_like);
        vm.like_processing = false;
        bk_like = null;
        cnt = 0;
        console.log(err);
      }
    };

    // VOTE
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
    vm.is_voted_all = () => {
      return vm.selectedOpts.length === vm.opts.length;
    };
    vm.toggleAll = () => {
      if (vm.selectedOpts.length === vm.opts.length) {
        vm.selectedOpts = [];
      } else if (vm.selectedOpts.length === 0 || vm.selectedOpts.length > 0) {
        vm.selectedOpts = _.pluck(vm.opts, '_id');
      }
    };
    vm.isIndeterminate = () => {
      return (vm.selectedOpts.length !== 0 && vm.selectedOpts.length !== vm.opts.length);
    };
    vm.voted_title = function() {
      return _.pluck(
        _.filter(vm.opts, function(opt) {
          return _.contains(vm.votedOpts, opt._id);
        }),
        'title'
      );
    };
    vm.cancel_vote = () => {
      $mdDialog.cancel();
    };
    vm.hide = () => {
      $mdDialog.hide();
    };
    vm.save_vote = save_vote;
    vm.show_vote = (ev) => {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'vote.dialog.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        locals: {
          vm: vm
        }
      })
      .then(function(answer) {
        $scope.status = 'You said the information was "' + answer + '".';
      }, function() {
        $scope.status = 'You cancelled the dialog.';
      });
    };

    function DialogController($scope, $mdDialog, vm) {
      $scope.vm = vm;
      $scope.hide = function() {
        $mdDialog.hide();
      };
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
      $scope.answer = function(answer) {
        $mdDialog.hide(answer);
      };
    }
  }
})();
