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
  ];

  function PollsController($scope, $state, $window, Authentication, poll, PollsApi, Tags, $aside, Cmts, Votes, VotesApi, Opts, Likes) {
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

    if (vm.poll._id) {
      // Get all Opts
      PollsApi.findOpts(poll._id)
        .then(res => {
          vm.opts = _.where(res.data, { status: 1 });
          return PollsApi.findVoteopts(poll._id);
        })
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
      // Get all Cmts
      PollsApi.findCmts(poll._id)
        .then(res => {
          vm.cmts = res.data;
        })
        .catch(err => {
          alert('error' + err);
        });
      // Get all Tags
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

    // Remove existing Poll
    vm.remove = () => {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.poll.$remove($state.go('polls.list'));
      }
    };

    // Save Poll
    vm.save = (isValid) => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.pollForm');
        return false;
      }
      // TODO: move create/update logic to service
      if (vm.poll._id) {
        vm.poll.$update(successCallback, errorCallback);
      } else {
        vm.poll.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('polls.view', {
          pollId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    };

    // Discard edit or add poll
    vm.discard = () => {
      if (angular.equals(vm.poll, vm.bk_poll)) {
        handle_discard();
      } else {
        if ($window.confirm('Are you sure you want to discard?')) {
          handle_discard();
        }
      }
    };

    // Back to before screen
    function handle_discard() {
      if (vm.poll._id) {
        $state.go('polls.view', { pollId: vm.poll._id });
      } else {
        $state.go('polls.list');
      }
    }

    // LIKES
    if (vm.poll._id && vm.authentication.user) {
      PollsApi.findPollLike(poll._id)
        .then(res => {
          vm.like = res.data || {};
          console.log(vm.like);
        })
        .catch(err => {
          alert('error' + err);
        });
    }
    vm.like_poll = () => {
      if (!vm.authentication.user) {
        return alert("You must login to like this poll.");
      }
      var _like;
      if (vm.like._id) {
        vm.like.type = 1;
        _like = new Likes(vm.like);
        _like.$update(successCallback, errorCallback);
      } else {
        _like = new Likes({ poll: vm.poll._id, user: vm.authentication.user._id, type: 1 });
        _like.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        console.log("liked");
      }

      function errorCallback(err) {
        console.log(err);
        //vm.error = res.data.message;
      }
    };

    vm.dislike_poll = () => {
      if (!vm.authentication.user) {
        return alert("You must login to dislike this poll.");
      }
      var _like;
      if (vm.like._id) {
        vm.like.type = 2;
        _like = new Likes(vm.like);
        _like.$update(successCallback, errorCallback);
      } else {
        _like = new Likes({ poll: vm.poll._id, user: vm.authentication.user._id, type: 2 });
        _like.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        console.log("disliked");
      }

      function errorCallback(err) {
        console.log(err);
        //vm.error = res.data.message;
      }
    };

    // OPTIONS
    vm.option = {};
    var opt_aside = $aside({
      scope: $scope,
      controllerAs: vm,
      templateUrl: 'modules/opts/client/views/new-opt-in-poll.client.view.html',
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
    var comment_aside = $aside({
      scope: $scope,
      controllerAs: vm,
      templateUrl: 'modules/cmts/client/views/new-cmt-in-poll.client.view.html',
      title: vm.poll.title,
      placement: 'bottom',
      animation: 'am-fade-and-slide-bottom',
      show: false
    });
    vm.comment = {};

    vm.aside_full_screen = () => {
      alert(1);
    };

    vm.input_cmt = (cmt) => {
      if (vm.authentication.user) {
        vm.comment = (!cmt) ? new Cmts() : new Cmts(cmt);
        comment_aside.$promise.then(comment_aside.show);
      } else {
        $state.go('authentication.signin');
      }
    };

    vm.save_cmt = ($form) => {
      if (!$form.$valid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.cmtForm');
        return false;
      }
      if (vm.comment._id) {
        vm.comment.isEdited = true;
        vm.comment.updated = new Date();
        vm.comment.$update(successCallback, errorCallback);
      } else {
        vm.comment.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        comment_aside.$promise.then(comment_aside.hide);
        $state.reload();
      }

      function errorCallback(err) {
        console.log(err);
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
      alert('like_cmt');
    };

    vm.dislike_cmt = (cmt) => {
      alert('dislike_cmt');
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
