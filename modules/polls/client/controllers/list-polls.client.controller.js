(function () {
  'use strict';
  angular
    .module('polls')
    .controller('PollsListController', PollsListController);

  PollsListController.$inject = [
    '$location',
    '$state',
    '$scope',
    '$window',
    'Socket',
    'Action',
    'TagsApi',
    'ProfileApi',
    'ngDialog',
    'Constants',
    'Socialshare',
    '$translate'
  ];

  function PollsListController(
    $location,
    $state,
    $scope,
    $window,
    Socket,
    Action,
    TagsApi,
    ProfileApi,
    dialog,
    Constants,
    Socialshare,
    $translate
  ) {
    var vm = this;

    vm.polls = [];
    vm.bestUsers = [];
    vm.tags = [];
    vm.new_data = [];
    vm.page = 0;
    vm.busy = false;
    vm.stopped = false;
    vm.is_has_new_polls = false;
    vm.supportLanguages = $window.supportLanguages;
    vm.language = $translate.use();

    onPrepare();

    function onPrepare() {
      // Lắng nghe sự liện từ socket
      prepareSocketListener();
      // Load danh sách tags (Bao gồm số poll)
      preparePopularTags();
      // Load các polls có lượng like nhiều nhất
      preparePopularPolls();
      // Load các polls có lượng like nhiều nhất
      prepareTopUsers();
      // Load danh sách poll đã bookmark
    }

    function prepareSocketListener() {
      if (!Socket.socket) {
        Socket.connect();
      }
      Socket.emit('subscribe_public');
      Socket.on('poll_create', () => {
        vm.is_has_new_polls = true;
      });
      $scope.$on('$destroy', function () {
        Socket.emit('unsubscribe_public');
        Socket.removeListener('poll_create');
      });
    }
    vm.handleLoadPolls = handleLoadPolls;
    function handleLoadPolls() {
      if (vm.stopped || vm.busy) return;
      vm.busy = true;
      Action.loadPolls(vm.page, vm.language)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            vm.stopped = true;
            vm.busy = false;
            return;
          }
          // Xử lý poll trước khi hiển thị màn hình
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
          vm.busy = false;
          if (!$scope.$$phase) $scope.$digest();
        })
        .catch(err => {
          vm.busy = false;
          vm.stopped = true;
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    }
    function prepareShowingData(poll) {
      return new Promise((resolve, reject) => {
        poll = Action.prepareShowingData(poll);
        return resolve(poll);
      });
    }
    function preparePopularPolls() {
      Action.loadPopularPolls(0, vm.language)
        .then(res => {
          vm.populars = res.data;
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    }
    function preparePopularTags() {
      TagsApi.loadPopularTags()
        .then(res => {
          vm.tags = res.data;
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    }
    function prepareTopUsers() {
      ProfileApi.loadTopUsers(10)
        .then(res => {
          vm.bestUsers = res.data;
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    }

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
    $scope.load_new = () => {
      $state.reload();
    };

    // Quick menu
    $scope.isOpen = false;
    $scope.q_quick_poll = () => {
      if (!$scope.isLogged) {
        $state.go('authentication.signin');
        return;
      }
      var q_quick_poll = dialog.open({
        template: '<quick-poll></quick-poll>',
        plain: true,
        controller: 'QuickPollController',
        controllerAs: 'vm',
        appendClassName: 'images-upload-dialog',
        closeByDocument: false
      });
    };
    $scope.q_post_poll = () => {
      $state.go('polls.create');
    };
    $scope.q_search = () => {
      $state.go('search');
    };
  }
})();
