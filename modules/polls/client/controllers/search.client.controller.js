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
    var vm = this;
    vm.form = {};

    // Ngôn ngữ đang sử dụng
    vm.language = Storages.get_local(Constants.storages.language);
    vm.condition = { language: vm.language };
    vm.polls = [];
    $scope.busy = false;

    initCondition();
    function initCondition() {
      var param = $location.search();
      if (_.isEmpty(param)) {
        vm.condition = JSON.parse(Storages.get_local(Constants.storages.public_search_condition, JSON.stringify({})));
        if (vm.condition.by) {
          Profile.get({ userId: vm.condition.by }, _user => {
            $scope.selectedUser = _user;
          });
        }
      } else {
        _.extend(vm.condition, param);
      }
      console.log(vm.condition);
      vm.start = (vm.condition.created_start) ? moment(vm.condition.created_start, 'YYYY/MM/DD') : undefined;
      vm.end = (vm.condition.created_end) ? moment(vm.condition.created_end, 'YYYY/MM/DD') : undefined;
      if (!_.isEmpty(param)) {
        handleSearch();
      }
    }

    vm.handleSearch = handleSearch;
    function handleSearch() {
      if ($scope.busy === true) return;
      $scope.busy = true;
      vm.polls = [];
      vm.condition.created_start = (vm.start) ? vm.start.format('YYYY/MM/DD') : undefined;
      vm.condition.created_end = (vm.end) ? vm.end.format('YYYY/MM/DD') : undefined;
      Action.searchPolls(vm.condition)
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
          vm.polls = results || [];
          $scope.busy = false;
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
          $scope.busy = false;
        });
      Storages.set_local(Constants.storages.public_search_condition, JSON.stringify(vm.condition));
    }

    function prepareShowingData(poll) {
      return new Promise((resolve, reject) => {
        poll = Action.prepareShowingData(poll);
        return resolve(poll);
      });
    }
    vm.handleClearCondition = () => {
      vm.condition = { language: vm.language };
      delete vm.start;
      delete vm.end;
      $scope.selectedUser = undefined;
      $scope.$broadcast('angucomplete-alt:clearInput');
    };
    vm.handleClearStartDate = () => {
      delete vm.condition.created_start;
      delete vm.start;
    };
    vm.handleClearEndDate = () => {
      delete vm.condition.created_end;
      delete vm.end;
    };
    vm.selectedUserFn = function (selected) {
      if (selected) {
        vm.condition.by = selected.originalObject._id;
        $scope.selectedUser = selected.originalObject;
      } else {
        delete vm.condition.by;
        $scope.selectedUser = undefined;
      }
    };

    // Thao tác khác
    $scope.handleDeletePoll = (poll) => {
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
        vm.polls = _.without(vm.polls, poll);
        Action.deletePoll(poll);
      });
    };
    $scope.handleReportPoll = (poll) => {
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
    $scope.handleBookmarkPoll = (poll) => {
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
    $scope.handleFollowPoll = (poll) => {
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
