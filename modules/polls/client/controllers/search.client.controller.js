'use strict';

angular.module('polls').controller('PollsSearchController', [
  '$location',
  '$scope',
  '$state',
  'Action',
  'Storages',
  'Constants',
  'ngDialog',
  'Profile',
  function ($location, $scope, $state, Action, Storages, Constants, dialog, Profile) {
    var ctrl = this;
    ctrl.form = {};

    // Ngôn ngữ đang sử dụng
    ctrl.language = Storages.get_local(Constants.storages.language);
    ctrl.condition = { language: ctrl.language };
    ctrl.polls = [];
    $scope.busy = false;

    initCondition();
    function initCondition() {
      var param = $location.search();
      if (_.isEmpty(param)) {
        ctrl.condition = JSON.parse(Storages.get_local(Constants.storages.public_search_condition, JSON.stringify({})));
        if (ctrl.condition.by) {
          Profile.get({ userId: ctrl.condition.by }, _user => {
            $scope.selectedUser = _user;
          });
        }
      } else {
        _.extend(ctrl.condition, param);
      }
      if (!_.isEmpty(param)) {
        handleSearch();
      }
    }

    ctrl.handleSearch = handleSearch;
    function handleSearch() {
      if ($scope.busy === true) return;
      $scope.busy = true;
      ctrl.polls = [];
      Action.search(ctrl.condition)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            $scope.busy = false;
            return;
          }
          var promises = [];
          res.data.forEach(poll => {
            promises.push(prepareShowingData(poll));
          });
          return Promise.all(promises);
        })
        .then(results => {
          // Gán data vào list hiện tại
          ctrl.polls = results || [];
          $scope.busy = false;
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
          $scope.busy = false;
        });
      Storages.set_local(Constants.storages.public_search_condition, JSON.stringify(ctrl.condition));
    }

    function prepareShowingData(poll) {
      return new Promise((resolve, reject) => {
        poll = Action.prepareShowingData(poll);
        return resolve(poll);
      });
    }
    ctrl.handleClearCondition = () => {
      ctrl.condition = { language: ctrl.language };
      $scope.selectedUser = undefined;
      $scope.$broadcast('angucomplete-alt:clearInput');
    };
    ctrl.handleClearStartDate = () => {
      delete ctrl.condition.created_start;
    };
    ctrl.handleClearEndDate = () => {
      delete ctrl.condition.created_end;
    };
    ctrl.selectedUserFn = function (selected) {
      if (selected) {
        ctrl.condition.by = selected.originalObject._id;
        $scope.selectedUser = selected.originalObject;
      } else {
        delete ctrl.condition.by;
        $scope.selectedUser = undefined;
      }
    };

    // Thao tác khác
    $scope.delete_poll = (poll) => {
      if (!poll.isCurrentUserOwner) {
        $scope.handleShowMessage('MS_CM_AUTH_ERROR', true);
        return;
      }
      // Gọi function show dialog từ scope cha
      $scope.handleShowConfirm({
        content: 'LB_POLLS_CONFIRM_DELETE',
        type: 3,
        button: 'LB_DELETE'
      }, confirm => {
        ctrl.polls = _.without(ctrl.polls, poll);
        Action.deletePoll(poll);
      });
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
        Action.saveReportPoll(poll, reason)
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
      Action.saveBookmarkPoll(poll._id)
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
      Action.saveFollowPoll(poll.follow)
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
