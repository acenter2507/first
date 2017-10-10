(function () {
  'use strict';

  // Categorys controller
  angular
    .module('categorys')
    .controller('CategoryPollsController', CategoryPollsController);

  CategoryPollsController.$inject = [
    '$scope',
    '$translate',
    'categoryResolve',
    'Action',
    'CategorysApi',
    'ngDialog'
  ];

  function CategoryPollsController(
    $scope,
    $translate,
    category,
    Action,
    CategorysApi,
    dialog
  ) {
    var vm = this;
    vm.category = category;

    // Infinity scroll
    $scope.stopped = false;
    $scope.busy = false;
    vm.page = 1;
    vm.sort = '-created';
    vm.language = $translate.use();
    vm.polls = [];

    handleLoadPolls();
    vm.handleLoadPolls = handleLoadPolls;
    function handleLoadPolls() {
      if ($scope.stopped || $scope.busy) return;
      $scope.busy = true;
      CategorysApi.loadPollByCategoryId(vm.category._id, vm.page, vm.language, vm.sort)
        .then(res => {
          if (!res.data.length || res.data.length === 0) return;
          // Load options và tính vote cho các opt trong polls
          var promises = [];
          res.data.forEach(poll => {
            promises.push(prepareShowingData(poll));
          });
          return Promise.all(promises);
        })
        .then(results => {
          // Gán data vào list hiện tại
          results = results || [];
          vm.polls = _.union(vm.polls, results);
          vm.page += 1;
          $scope.busy = false;
          if (results.length < 10) $scope.stopped = true;
          if (!$scope.$$phase) $scope.$digest();
        })
        .catch(err => {
          $scope.busy = false;
          $scope.stopped = true;
          $scope.handleShowMessage(err.message, true);
        });
    }
    vm.handleChangeSortType = handleChangeSortType;
    function handleChangeSortType() {
      vm.page = 1;
      $scope.busy = $scope.stopped = false;
      vm.polls = [];
      handleLoadPolls();
    }
    function prepareShowingData(poll) {
      return new Promise((resolve, reject) => {
        poll = Action.prepareShowingData(poll);
        return resolve(poll);
      });
    }

    
    $scope.poll_filter = poll => {
      if (poll.isPublic) {
        return true;
      } else {
        return poll.isCurrentUserOwner;
      }
    };

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
            $scope.handleShowMessage(err.message, true);
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
          $scope.handleShowMessage(err.message, true);
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
          $scope.handleShowMessage(err.message, true);
        });
    };
  }
}());
