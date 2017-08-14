'use strict';

angular.module('polls').controller('PollsSearchController', [
  '$location',
  '$rootScope',
  '$scope',
  '$state',
  'Authentication',
  'CategorysService',
  'Action',
  '$stateParams',
  'Storages',
  'Constants',
  'toastr',
  'ngDialog',
  'Profile',
  function ($location, $rootScope, $scope, $state, Authentication, Categorys, Action, $stateParams, Storages, Constants, toast, dialog, Profile) {
    $scope.user = Authentication.user;
    $scope.isLogged = ($scope.user) ? true : false;
    $scope.detailToggle = -1;
    $scope.form = {};
    $scope.categorys = Categorys.query();

    $scope.condition = {};
    initCondition();
    function initCondition() {
      console.log($location.search());
      if ($stateParams.key) {
        $scope.condition.key = $stateParams.key;
        $scope.condition.in = $stateParams.in;
        Storages.set_local(Constants.storages.public_search_condition, JSON.stringify($scope.condition));
      } else {
        $scope.condition = JSON.parse(Storages.get_local(Constants.storages.public_search_condition, JSON.stringify({})));
        if ($scope.condition.by) {
          Profile.get({ userId: $scope.condition.by }, _user => {
            $scope.selectedUser = _user;
          });
        }
      }
      search();
    }
    // $scope.condition.key = $stateParams.key;
    // $scope.condition.in = $stateParams.in;
    // $scope.condition.status = $stateParams.status;
    // $scope.condition.ctgr = $stateParams.ctgr;

    // $scope.condition.cmt = $stateParams.cmt;
    // $scope.condition.compare = $stateParams.compare;

    // $scope.condition.created = $stateParams.created;
    // $scope.condition.timing = $stateParams.timing;

    // $scope.condition.sort = $stateParams.sort;
    // $scope.condition.sortkind = $stateParams.sortkind;

    // $scope.condition.by = $stateParams.by;
    // if ($scope.condition.by) {
    //   Profile.get({ userId: $scope.condition.by }, _user => {
    //     $scope.selectedUser = _user;
    //   });
    // }
    $scope.search = search;
    function search() {
      //$state.go('search', $scope.condition);
    };

    $scope.busy = false;
    $scope.polls = [];
    $scope.sort = '-poll.created';
    //excute();
    function excute() {
      if (check_params()) {
        $scope.busy = true;
        Action.search($scope.condition)
          .then(res => {
            $scope.polls = res.data;
            create_sort();
            $scope.busy = false;
          })
          .catch(err => {
            $scope.busy = false;
            console.log(err);
          });
      } else {
        $scope.condition = JSON.parse(Storages.get_local(Constants.storages.preferences, JSON.stringify({})));
      }
    }
    function check_params() {
      if ($scope.condition.key || $scope.condition.status || $scope.condition.by || $scope.condition.ctgr || $scope.condition.cmt || $scope.condition.created) {
        return true;
      }
      return false;
    }
    function create_sort() {
      if ($scope.condition.sort) {
        var prefix = ($scope.condition.sort === 'created') ? 'poll.' : 'report.';
        var kind = ($scope.condition.sortkind === 'desc') ? '-' : '';
        $scope.sort = kind + prefix + $scope.condition.sort;
      }
    }

    $scope.selectedUserFn = function (selected) {
      if (selected) {
        $scope.condition.by = selected.originalObject._id;
        $scope.selectedUser = selected.originalObject;
      } else {
        $scope.condition.by = undefined;
        $scope.selectedUser = undefined;
      }
    };
    $scope.clear_preferences = () => {
      $scope.condition = {};
      $scope.selectedUser = undefined;
      $scope.$broadcast('angucomplete-alt:clearInput');
      Storages.set_local(Constants.storages.preferences, JSON.stringify($scope.condition));
      $location.url($location.path());
    };

    $scope.clear_ctgr = () => {
      $scope.condition.ctgr = undefined;
    };

    $scope.save_preferences = () => {
      Storages.set_local(Constants.storages.preferences, JSON.stringify($scope.condition));
    };

    $scope.delete_poll = (poll) => {
      if (poll.user._id !== $scope.user._id) {
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
        $scope.polls = _.reject($scope.polls, function (item) {
          return item.poll._id === poll._id;
        });
        // Action.delete_poll(poll);
      }
    };
    $scope.report_poll = (poll) => {
      if (poll.reported) {
        toast.error('You are already reported ' + poll.title, 'Error!');
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
            toast.success('You have successfully reported ' + poll.title, 'Thank you!');
          })
          .catch(err => {
            toast.error(err.message, 'Error!');
          });
      }
    };
    $scope.bookmark_poll = (poll) => {
      if (poll.bookmarked) {
        toast.error('You are already bookmark ' + poll.title, 'Error!');
        return;
      }
      Action.save_bookmark(poll._id)
        .then(res => {
          poll.bookmarked = (res) ? true : false;
          toast.success('Added ' + poll.title + ' to bookmarks.', 'Success!');
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    };
    $scope.follow_poll = (poll) => {
      if (!$scope.isLogged) {
        toast.error('You must login to follow poll.', 'Error!');
        return;
      }
      Action.save_follow(poll.follow)
        .then(res => {
          if (res) {
            poll.follow = res;
            toast.success('You followed ' + poll.title, 'Success!');
          } else {
            poll.follow = { poll: poll._id };
          }
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    };
  }
]);
