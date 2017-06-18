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
    'CmtsService'
  ];

  function PollsController($scope, $state, $window, Authentication, poll, PollsApi, Tags, $aside, Cmts) {
    var vm = this;

    vm.authentication = Authentication;
    vm.poll = poll;
    vm.poll.close = (vm.poll.close) ? moment(vm.poll.close) : vm.poll.close;
    vm.poll.tags = [];
    vm.bk_poll = angular.copy(poll);
    vm.close_min = new Date();
    vm.error = null;
    vm.form = {};

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
          console.log(vm.cmts);
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
    }

    // Function
    vm.remove = remove;
    vm.save = save;
    vm.discard = discard;

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

    // Comment
    vm.comment_form = {
      scope: $scope,
      controllerAs: vm,
      templateUrl: 'modules/cmts/client/views/new-cmt-in-poll.client.view.html',
      title: vm.poll.title,
      placement: 'bottom',
      animation: 'am-fade-and-slide-bottom'
    };
    vm.comment = {};
    vm.comment_form_change_screen = comment_form_change_screen;
    vm.send_comment = send_comment;
    vm.save_comment = save_comment;
    vm.reply = reply;

    function comment_form_change_screen() {
      alert(1);
    }

    function send_comment($form) {
      if (!$form.$valid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.cmtForm');
        return false;
      }
      save_comment();
    }

    function save_comment() {
      console.log(vm.comment);
    }

    function reply(cmt) {
      if (vm.authentication.user) {
        vm.comment_form.comment = (cmt) ? new Cmts() : cmt;
        $aside(vm.comment_form);
      } else {
        $state.go('authentication.signin');
      }
    }
  }
}());
