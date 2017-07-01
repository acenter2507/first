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
    'CmtsService',
    'VotesService',
    'VotesApi',
    'OptsService',
    'CmtsApi',
    'CmtlikesService',
    'Socket',
    '$bsModal',
    '$bsAside',
    '$mdDialog',
    '$timeout',
    'Remaining',
    'Action'
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
    Cmts,
    Votes,
    VotesApi,
    Opts,
    CmtsApi,
    Cmtlikes,
    Socket,
    $bsModal,
    $bsAside,
    $mdDialog,
    $timeout,
    Remaining,
    Action
  ) {
    var vm = this;
    vm.authentication = Authentication;
    vm.isLogged = vm.authentication.user ? true : false;
    vm.poll = poll;
    vm.poll.close = vm.poll.close ? moment(vm.poll.close) : vm.poll.close;
    vm.isClosed = vm.poll.close ? moment(vm.poll.close).isBefore(new moment()) : false;
    vm.poll.tags = [];
    vm.form = {};
    
    // Options variable
    vm.opts = [];
    vm.tmp_opt = {};
    vm.opt_aside = {};

    vm.cmt_sorts = [
      { val: '-created', name: 'Newest to oldest' },
      { val: 'created', name: 'Oldest to newest' },
      { val: '-likeCnt', name: 'Most likes' }
    ];
    vm.cmt_sort = vm.cmt_sorts[0];
    vm.enter_send = false;

    vm.like = {};
    vm.follow = {};
    vm.votes = [];
    vm.voteopts = [];
    vm.chart = { type: 'pie' };
    vm.chart.options = { responsive: true };
    vm.votedTotal = 0;
    vm.error = null;

    // Infinity scroll
    vm.cmts = [];
    vm.new_cmts = [];
    vm.page = 0;
    vm.busy = false;
    vm.stopped = false;

    vm.cmt_processing = false;
    vm.cmt_typing = false;
    vm.like_processing = false;
    vm.tmp_cmt = {};
    vm.optionToggle = -1;

    vm.close_duration = {};
    vm.remaining = 1;

    init();

    // Init data
    function init() {
      if (!vm.poll._id) {
        $state.go('polls.list');
      }
      // Get all Opts
      loadOpts();
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
      if (!vm.isClosed && vm.poll.close) {
        loadRemaining();
      }
      // Init socket
      initSocket();
    }

    // Init Socket
    function initSocket() {
      if (!Socket.socket) {
        Socket.connect();
      }
      Socket.emit('subscribe_poll', {
        pollId: vm.poll._id,
        userId: vm.authentication.user._id
      });
      Socket.on('cmt_add', cmtId => {
        loadNewCmt(cmtId).then(
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
        alert('This poll has been deleted by owner. Please back to list screen.');
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
        Socket.emit('unsubscribe_poll', {
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
        if (!vm.isLogged) {
          cmt.like = {};
          return resolve(cmt);
        } else {
          CmtsApi.findLike(cmt._id)
            .then(res => {
              cmt.like = res.data || {};
              return resolve(cmt);
            })
            .catch(err => {
              return reject('error' + err);
            });
        }
      });
    }

    vm.loadCmts = loadCmts;
    function loadCmts() {
      if (vm.stopped || vm.busy) return;
      vm.busy = true;
      PollsApi.findCmts(vm.poll._id, vm.page)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            vm.stopped = true;
            vm.busy = false;
            return;
          }
          // Lấy data trả về
          vm.new_cmts = res.data || [];
          // Gán data vào danh sách comment hiện tại
          vm.cmts = _.union(vm.cmts, vm.new_cmts);
          vm.page += 1;
          vm.busy = false;
          // Load thông tin like cho các comment mới
          var promises = [];
          vm.new_cmts.forEach(cmt => {
            promises.push(loadLikeCmt(cmt));
          });
          return Promise.all(promises);
        })
        .then(res => {
        })
        .catch(err => {
          alert('error' + err);
        });
    }

    function loadNewCmt(cmtId) {
      return new Promise((resolve, reject) => {
        Cmts.get({ cmtId: cmtId })
          .$promise.then(_cmt => {
            return loadLikeCmt(_cmt);
          })
          .then(_cmt => {
            var item = _.findWhere(vm.cmts, { _id: _cmt._id });
            if (item) {
              _.extend(_.findWhere(vm.cmts, { _id: _cmt._id }), _cmt);
            } else {
              vm.cmts.push(_cmt);
              vm.poll.cmtCnt += 1;
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
      if (!vm.isLogged) {
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
            vm.ownVote = res && res.data ? res.data : { poll: vm.poll._id };
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
            vm.follow = res.data || { poll: vm.poll._id };
            return resolve(res);
          })
          .catch(err => {
            alert(err + '');
            return reject(err);
          });
      });
    }

    function loadRemaining() {
      vm.remaining = $timeout(makeRemaining, 1000);
      $scope.$on('$destroy', () => {
        $timeout.cancel(vm.remaining);
      });
    }

    function makeRemaining() {
      vm.close_duration = Remaining.duration(vm.poll.close);
      vm.isClosed = moment(vm.poll.close).isBefore(new moment());
      if (!vm.isClosed) {
        vm.remaining = $timeout(makeRemaining, 1000);
      } else {
        $timeout.cancel(vm.remaining);
      }
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
      Action.save_cmt(vm.poll._id, vm.tmp_cmt)
        .then(res => {
          vm.tmp_cmt = {};
          vm.cmt_processing = false;
          vm.cmt_typing = false;
        })
        .catch(err => {
          alert('' + err);
          vm.cmt_processing = false;
        });
    }

    function save_vote() {
      if (!vm.authentication.user && !vm.poll.allow_guest) {
        return $state.go('authentication.signin');
      }
      if (!vm.selectedOpts.length || vm.selectedOpts.length === 0) {
        return alert('You must vote at least one option.');
      }
      Action.save_vote(vm.ownVote, vm.selectedOpts)
        .then(res => {
          vm.ownVote = res;
          $scope.$apply();
        })
        .catch(err => {
          vm.selectedOpts = angular.copy(vm.votedOpts) || [];
          alert(err);
        });
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
          Socket.emit('poll_delete', { pollId: vm.poll._id });
          $state.go('polls.list');
        });
      }
    };

    vm.like_poll = type => {
      if (!vm.isLogged) {
        return alert('You must login to like this poll.');
      }
      if (vm.poll.isCurrentUserOwner) {
        return alert('You cannot like your poll.');
      }
      if (vm.like_processing) {
        return alert('You cannot interact continuously.');
      }
      vm.like_processing = true;
      Action.save_like(vm.like, type, vm.poll)
        .then(res => {
          vm.poll.likeCnt = res.likeCnt;
          vm.like = res.like;
          vm.like_processing = false;
          $scope.$apply();
        })
        .catch(err => {
          vm.like_processing = false;
          alert(err);
        });
    };

    vm.follow_poll = () => {
      if (!vm.isLogged) {
        return alert('You must login to dislike this poll.');
      }
      Action.save_follow(vm.follow)
        .then(res => {
          vm.follow = res;
          $scope.$apply();
          console.log('follow success:');
        })
        .catch(err => {
          alert(err);
        });
    };

    // OPTIONS
    vm.opt_aside = $bsAside({
      scope: $scope,
      controllerAs: vm,
      templateUrl: 'modules/polls/client/views/new-opt.client.view.html',
      title: 'Suggest new option',
      placement: 'bottom',
      animation: 'am-fade-and-slide-bottom',
      show: false
    });

    // Click button add option
    vm.input_opt = opt => {
      vm.tmp_opt = (!opt) ? { poll: vm.poll._id, title: '', body: '', status: 2 } : opt;
      vm.opt_aside.$promise.then(vm.opt_aside.show);
    };
    // Click button save option
    vm.save_opt = isValid => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.optForm');
        return false;
      }
      Action.save_opt(vm.tmp_opt)
        .then(res => {
          vm.opt_aside.$promise.then(vm.opt_aside.hide);
          alert('Your option is waiting for approve. Thanks.');
        })
        .catch(err => {
          alert(err);
        });
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
        Action.delete_cmt(cmt);
      }
    };
    var cnt = 0;
    vm.focus_cmt = () => {
      if (!vm.isLogged) {
        alert('You must login to comment.');
      }
      vm.cmt_typing = true;
    };

    vm.like_cmt = (cmt, type) => {
      if (!vm.isLogged) {
        return alert('You must login to like this poll.');
      }
      if (vm.authentication.user._id === cmt.user._id) {
        return alert('You cannot like your comment.');
      }
      if (vm.like_processing) {
        return alert('You cannot interact continuously.');
      }
      vm.like_processing = true;
      Action.save_like_cmt(cmt, type)
        .then(res => {
          cmt.like = res.like;
          cmt.likeCnt = res.likeCnt;
          vm.like_processing = false;
          $scope.$apply();
        })
        .catch(err => {
          vm.like_processing = false;
          alert(err);
        });
      // var rs_like;
      // var bk_like = _.clone(cmt.like);
      // if (cmt.like._id) {
      //   switch (cmt.like.type) {
      //     case 0:
      //       cnt = 1;
      //       cmt.like.type = 1;
      //       break;

      //     case 1:
      //       cnt = -1;
      //       cmt.like.type = 0;
      //       break;

      //     case 2:
      //       cnt = 2;
      //       cmt.like.type = 1;
      //       break;
      //   }
      //   cmt.likeCnt += cnt;
      //   rs_like = new Cmtlikes(cmt.like);
      //   rs_like.cnt = cnt;
      //   rs_like.$update(successCallback, errorCallback);
      // } else {
      //   cnt = 1;
      //   cmt.likeCnt += cnt;
      //   rs_like = new Cmtlikes({ cmt: cmt._id, type: 1 });
      //   rs_like.cnt = cnt;
      //   rs_like.$save(successCallback, errorCallback);
      // }

      // function successCallback(res) {
      //   cmt.like = res.like;
      //   Socket.emit('cmt_like', {
      //     pollId: vm.poll._id,
      //     cmtId: cmt._id,
      //     likeCnt: res.likeCnt,
      //     from: vm.authentication.user._id,
      //     to: cmt.user._id,
      //     type: res.like.type
      //   });
      //   vm.like_processing = false;
      //   bk_like = null;
      //   cnt = 0;
      //   console.log('liked');
      // }

      // function errorCallback(err) {
      //   cmt.likeCnt -= cnt;
      //   cmt.like = _.clone(bk_like);
      //   vm.like_processing = false;
      //   bk_like = null;
      //   cnt = 0;
      //   console.log(err);
      // }
    };

    // vm.dislike_cmt = cmt => {
    //   if (!vm.isLogged) {
    //     return alert('You must login to dislike this poll.');
    //   }
    //   if (vm.authentication.user._id === cmt.user._id) {
    //     return alert('You cannot dislike your comment.');
    //   }
    //   if (vm.like_processing) {
    //     return alert('You cannot interact continuously.');
    //   }

    //   var rs_dislike;
    //   vm.like_processing = true;
    //   var bk_like = _.clone(cmt.like);
    //   if (cmt.like._id) {
    //     switch (cmt.like.type) {
    //       case 0:
    //         cnt = -1;
    //         cmt.like.type = 2;
    //         break;

    //       case 1:
    //         cnt = -2;
    //         cmt.like.type = 2;
    //         break;

    //       case 2:
    //         cnt = 1;
    //         cmt.like.type = 0;
    //         break;
    //     }
    //     cmt.likeCnt += cnt;
    //     rs_dislike = new Cmtlikes(cmt.like);
    //     rs_dislike.cnt = cnt;
    //     rs_dislike.$update(successCallback, errorCallback);
    //   } else {
    //     cnt = -1;
    //     cmt.likeCnt += cnt;
    //     rs_dislike = new Cmtlikes({ cmt: cmt._id, type: 2 });
    //     rs_dislike.cnt = cnt;
    //     rs_dislike.$save(successCallback, errorCallback);
    //   }

    //   function successCallback(res) {
    //     cmt.like = res.like;
    //     Socket.emit('cmt_like', {
    //       pollId: vm.poll._id,
    //       cmtId: cmt._id,
    //       likeCnt: res.likeCnt,
    //       from: vm.authentication.user._id,
    //       to: cmt.user._id,
    //       type: res.like.type
    //     });
    //     vm.like_processing = false;
    //     bk_like = null;
    //     cnt = 0;
    //     console.log('liked');
    //   }

    //   function errorCallback(err) {
    //     cmt.likeCnt -= cnt;
    //     cmt.like = _.clone(bk_like);
    //     vm.like_processing = false;
    //     bk_like = null;
    //     cnt = 0;
    //     console.log(err);
    //   }
    // };

    // VOTE
    vm.checked = function(id) {
      if (vm.poll.allow_multiple) {
        if (_.contains(vm.selectedOpts, id)) {
          vm.selectedOpts = _.without(vm.selectedOpts, id);
        } else {
          vm.selectedOpts.push(id);
        }
      } else {
        if (!_.contains(vm.selectedOpts, id)) {
          vm.selectedOpts = [id];
        }
      }
    };
    vm.is_can_vote = () => {
      if (vm.poll.allow_guest) {
        return true;
      } else {
        return vm.isLogged;
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
    vm.save_vote = save_vote;
    
    vm.toggle_chart = () => {
      vm.chart.type = vm.chart.type === 'polarArea' ? 
        'pie' : 'polarArea';
    };
  }
})();
