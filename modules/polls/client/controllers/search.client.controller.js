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
    $scope.busy = false;
    $scope.polls = [];

    initCondition();
    function initCondition() {
      var param = $location.search();
      if (_.isEmpty(param)) {
        $scope.condition = JSON.parse(Storages.get_local(Constants.storages.public_search_condition, JSON.stringify({})));
        if ($scope.condition.by) {
          Profile.get({ userId: $scope.condition.by }, _user => {
            $scope.selectedUser = _user;
          });
        }
      } else {
        _.extend($scope.condition, param);
      }
      if (!_.isEmpty(param)) {
        search();
      }
    }

    $scope.search = search;
    function search() {
      if ($scope.busy === true) return;
      $scope.busy = true;
      Action.search($scope.condition)
        .then(res => {
          $scope.polls = res.data;
          $scope.busy = false;
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
          $scope.busy = false;
        });
      Storages.set_local(Constants.storages.public_search_condition, JSON.stringify($scope.condition));
    }
    $scope.buildPager = buildPager;
    function buildPager() {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 10;
      // figureOutItemsToDisplay();
      $scope.busy = false;
    }

    $scope.clear_filter = () => {
      $scope.condition = {};
      $scope.selectedUser = undefined;
      $scope.$broadcast('angucomplete-alt:clearInput');
    };
    $scope.clear_created_start = () => {
      delete $scope.condition.created_start;
    };
    $scope.clear_created_end = () => {
      delete $scope.condition.created_end;
    };
    $scope.selectedUserFn = function (selected) {
      if (selected) {
        $scope.condition.by = selected.originalObject._id;
        $scope.selectedUser = selected.originalObject;
      } else {
        delete $scope.condition.by;
        $scope.selectedUser = undefined;
      }
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
