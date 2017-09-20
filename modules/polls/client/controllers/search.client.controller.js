'use strict';

angular.module('polls').controller('PollsSearchController', [
  '$location',
  '$rootScope',
  '$scope',
  '$state',
  'Authentication',
  'Action',
  '$stateParams',
  'Storages',
  'Constants',
  'ngDialog',
  'Profile',
  function ($location, $rootScope, $scope, $state, Authentication, Action, $stateParams, Storages, Constants, dialog, Profile) {
    $scope.form = {};

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
      $scope.polls = [];
      Action.search($scope.condition)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            $scope.busy = false;
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
          $scope.polls = results || [];
          $scope.busy = false;
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
          $scope.busy = false;
        });
      Storages.set_local(Constants.storages.public_search_condition, JSON.stringify($scope.condition));
    }

    function process_before_show(poll) {
      return new Promise((resolve, reject) => {
        poll = Action.process_before_show(poll);
        return resolve(poll);
      });
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

    // Thao tác khác
    $scope.delete_poll = (poll) => {
      if (!poll.isCurrentUserOwner) {
        $scope.handleShowMessage('MS_CM_AUTH_ERROR', true);
        return;
      }
      $scope.message = {};
      $scope.message.content = 'LB_POLLS_CONFIRM_DELETE';
      $scope.message.type = 3;
      $scope.message.button = 'LB_DELETE';
      dialog.openConfirm({
        scope: $scope,
        templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
      }).then(confirm => {
        handle_delete();
      }, reject => {
        delete $scope.message;
      });
      function handle_delete() {
        delete $scope.message;
        $scope.polls = _.without($scope.polls, poll);
        Action.delete_poll(poll);
      }
    };
    $scope.report_poll = (poll) => {
      if (poll.reported) {
        $scope.handleShowMessageWithParam('MS_CM_REPORT_EXIST_ERROR', { title: poll.title }, true);
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
            $scope.handleShowMessageWithParam('MS_CM_REPORT_SUCCESS', { title: poll.title }, false);
          })
          .catch(err => {
            $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
          });
      }
    };
    $scope.bookmark_poll = (poll) => {
      if (poll.bookmarked) {
        $scope.handleShowMessageWithParam('MS_CM_BOOKMARK_EXIST_ERROR', { title: poll.title }, true);
        return;
      }
      Action.save_bookmark(poll._id)
        .then(res => {
          poll.bookmarked = (res) ? true : false;
          $scope.handleShowMessageWithParam('MS_CM_BOOKMARK_SUCCESS', { title: poll.title }, false);
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    };
    $scope.follow_poll = (poll) => {
      if (!$scope.isLogged) {
        $scope.handleShowMessage('MS_CM_LOGIN_ERROR', true);
        return;
      }
      Action.save_follow(poll.follow)
        .then(res => {
          if (res) {
            poll.follow = res;
          } else {
            poll.follow = { poll: poll._id };
          }
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    };
  }
]);
