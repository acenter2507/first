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
    'filterFilter',
    'Authentication',
    'pollResolve',
    'PollsApi',
    'TagsService',
    '$aside',
    'CmtsService',
    'VotesService',
  ];

  function PollsController($scope, $state, $window, filterFilter, Authentication, poll, PollsApi, Tags, $modal, $aside, Cmts, Votes) {
    var vm = this;

    vm.authentication = Authentication;
    vm.poll = poll;
    vm.poll.close = (vm.poll.close) ? moment(vm.poll.close) : vm.poll.close;
    vm.poll.tags = [];
    vm.bk_poll = angular.copy(poll);
    vm.close_min = new Date();
    vm.error = null;
    vm.form = {};
    vm.cmt_sorts = [
      { val: '-updated', name: 'Newest to oldest' },
      { val: 'updated', name: 'Oldest to newest' },
      { val: '-likeCnt', name: 'Most likes' }
    ];
    vm.cmt_sort = '-updated';

    if (vm.poll._id) {
      // Get all Opts
      PollsApi.findOpts(poll._id)
        .then(opts => {
          vm.opts = opts.data;
        })
        .catch(err => {
          alert('error' + err);
        });
      // Get all Cmts
      PollsApi.findCmts(poll._id)
        .then(cmts => {
          vm.cmts = cmts.data;
        })
        .catch(err => {
          alert('error' + err);
        });
      // Get all Cmts
      PollsApi.findTags(poll._id)
        .then(polltags => {
          angular.forEach(polltags.data, (polltag, index) => {
            vm.poll.tags.push(polltag.tag);
          });
        })
        .catch(err => {
          alert('error' + err);
        });
      // Get all Votes
      // PollsApi.findVotes(poll._id)
      //   .then(votes => {
      //     vm.votes = votes.data;
      //   })
      //   .catch(err => {
      //     alert('error' + err);
      //   });
      PollsApi.findOwnerVote(poll._id)
        .then(vote => {
          vm.ownVote = vote.data;
        })
        .catch(err => {
          // alert('error' + err);
          console.log(err);
        });
    }

    // Function
    vm.remove = remove;
    vm.save = save;
    vm.discard = discard;
    vm.like_poll = like_poll;
    vm.dislike_poll = dislike_poll;

    // Remove existing Poll
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.poll.$remove($state.go('polls.list'));
      }
    }

    // Save Poll
    function save(isValid) {
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
    }

    // Discard edit or add poll
    function discard() {
      if (angular.equals(vm.poll, vm.bk_poll)) {
        handle_discard();
      } else {
        if ($window.confirm('Are you sure you want to discard?')) {
          handle_discard();
        }
      }
    }

    // Back to before screen
    function handle_discard() {
      if (vm.poll._id) {
        $state.go('polls.view', { pollId: vm.poll._id });
      } else {
        $state.go('polls.list');
      }
    }

    function like_poll() {
      alert("like_poll");
    }

    function dislike_poll() {
      alert("dislike_poll");
    }
    // Comment
    vm.comment_form = {
      scope: $scope,
      controllerAs: vm,
      templateUrl: 'modules/cmts/client/views/new-cmt-in-poll.client.view.html',
      title: vm.poll.title,
      placement: 'bottom',
      animation: 'am-fade-and-slide-bottom',
      show: false
    };
    var comment_aside = $aside(vm.comment_form);
    vm.comment = {};
    vm.comment_form_change_screen = comment_form_change_screen;
    vm.send_comment = send_comment;
    vm.reply = reply;

    function comment_form_change_screen() {
      alert(1);
    }

    function send_comment($form) {
      if (!$form.$valid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.cmtForm');
        return false;
      }
      if (vm.comment._id) {
        vm.comment.isEdited = true;
        vm.comment.updated = new Date();
        vm.comment.$update(successCallback, errorCallback);
      } else {
        vm.poll.cmtCnt += 1;
        vm.poll.$update((_poll) => {
          vm.comment.poll = _poll;
          vm.comment.$save(successCallback, errorCallback);
        }, errorCallback);
      }

      function successCallback(res) {
        comment_aside.$promise.then(comment_aside.hide);
        $state.reload();
        // $state.go('polls.view', {
        //   pollId: res._id
        // });
      }

      function errorCallback(err) {
        console.log(err);
        //vm.error = res.data.message;
      }
    }

    function reply(cmt) {
      if (vm.authentication.user) {
        vm.comment = (!cmt) ? new Cmts() : new Cmts(cmt);
        comment_aside.$promise.then(comment_aside.show);
      } else {
        $state.go('authentication.signin');
      }
    }

    vm.reply_cmt = reply_cmt;
    vm.edit_cmt = edit_cmt;
    vm.delete_cmt = delete_cmt;
    vm.like_cmt = like_cmt;
    vm.dislike_cmt = dislike_cmt;

    function reply_cmt(cmt) {
      alert('reply_cmt');
    }

    function edit_cmt(cmt) {
      reply(cmt);
    }

    function delete_cmt(cmt) {
      alert('delete_cmt');
    }

    function like_cmt(cmt) {
      alert('like_cmt');
    }

    function dislike_cmt(cmt) {
      alert('dislike_cmt');
    }

    // VOTE
    vm.send_vote = send_vote;
    vm.voteds = [];

    vm.checked = function() {
      vm.voteds = filterFilter(vm.opts, { selected: true });
    };

    function send_vote() {
      console.log($scope.voteds);
      
    }
  }
}());
