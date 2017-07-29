(function () {
  'use strict';

  // Tags controller
  angular
    .module('tags')
    .controller('TagsController', TagsController);

  TagsController.$inject = [
    '$scope',
    '$state',
    '$window',
    'Authentication',
    'tagResolve',
    'Action',
    'toastr',
    'ngDialog'
  ];

  function TagsController(
    $scope,
    $state,
    $window,
    Authentication,
    tag,
    Action,
    toast,
    dialog
  ) {
    var vm = this;

    vm.authentication = Authentication;
    vm.tag = tag;

    // Infinity scroll
    vm.busy = false;
    vm.sort = '-created';
    vm.polls = [];

    vm.get_polls = get_polls;
    function get_polls() {
      if (vm.busy) return;
      vm.busy = true;
      Action.get_tag_polls(vm.tag._id)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            vm.busy = false;
            return;
          }
          var promises = [];
          res.data.forEach(poll => {
            promises.push(process_before_show(poll));
          });
          return Promise.all(promises);
        })
        .then(results => {
          // Gán data vào list hiện tại
          vm.polls = results;
          vm.busy = false;
        })
        .catch(err => {
          vm.busy = false;
          toast.error(err.message, 'Error!');
        });
    }
    function process_before_show(poll) {
      return new Promise((resolve, reject) => {
        poll.isCurrentUserOwner = vm.isLogged && vm.user._id === poll.user._id;
        poll.chart = {
          options: { responsive: true },
          colors: [],
          labels: [],
          data: []
        };
        poll.total = poll.voteopts.length;
        poll.opts.forEach(opt => {
          opt.voteCnt = _.where(poll.voteopts, { opt: opt._id }).length || 0;
          opt.progressVal = calPercen(poll.total, opt.voteCnt);
          poll.chart.data.push(opt.voteCnt);
          poll.chart.colors.push(opt.color);
          poll.chart.labels.push(opt.title);
        });
        return resolve(poll);
      });
    }

    // Tính phần trăm tỉ lệ vote cho opt
    function calPercen(total, value) {
      if (total === 0) {
        return 0;
      }
      return Math.floor(value * 100 / total) || 0;
    }


    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    vm.poll_filter = poll => {
      if (poll.isPublic) {
        return true;
      } else {
        return poll.isCurrentUserOwner;
      }
    };
    vm.delete_poll = (poll) => {
      if (!poll.isCurrentUserOwner) {
        toast.error('You are not authorized.', 'Error!');
        return;
      }
      $scope.message_title = 'Delete poll!';
      $scope.message_content = 'Are you sure you want to delete this poll?';
      $scope.dialog_type = 3;
      $scope.buton_label = 'delete';
      dialog.openConfirm({
        scope: $scope,
        templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
      }).then(confirm => {
        handle_delete();
      }, reject => {
      });
      function handle_delete() {
        vm.polls = _.without(vm.polls, poll);
        Action.delete_poll(poll);
      }
    };
    vm.report_poll = (poll) => {
      if (poll.reported) {
        toast.error('You are already report this poll.', 'Error!');
        return;
      }
      dialog.openConfirm({
        scope: $scope,
        templateUrl: 'modules/core/client/views/templates/report.dialog.template.html'
      }).then(reason => {
        handle_confirm(reason);
      }, reject => {
      });
      function handle_confirm(reason) {
        Action.save_report(poll, reason)
          .then(res => {
            poll.reported = (res) ? true : false;
            toast.success('You have successfully reported this poll.', 'Thank you!');
          })
          .catch(err => {
            toast.error(err.message, 'Error!');
          });
      }
    };
    vm.bookmark_poll = (poll) => {
      if (poll.bookmarked) {
        toast.error('You are already bookmark this poll.', 'Error!');
        return;
      }
      Action.save_bookmark(poll._id)
        .then(res => {
          poll.bookmarked = (res) ? true : false;
          toast.success('Added to bookmarks.', 'Success!');
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    };
    vm.follow_poll = (poll) => {
      if (!vm.isLogged) {
        toast.error('You must login to follow this poll.', 'Error!');
        return;
      }
      Action.save_follow(poll.follow)
        .then(res => {
          poll.follow = res;
          $scope.$apply();
          toast.success('You followed this poll.', 'Success!');
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    };
    // Remove existing Tag
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.tag.$remove($state.go('tags.list'));
      }
    }

    // Save Tag
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.tagForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.tag._id) {
        vm.tag.$update(successCallback, errorCallback);
      } else {
        vm.tag.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('tags.view', {
          tagId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
