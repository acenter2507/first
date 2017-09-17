(function () {
  'use strict';
  angular
    .module('polls')
    .controller('PollsListController', PollsListController);

  PollsListController.$inject = [
    '$location',
    '$rootScope',
    '$state',
    '$scope',
    '$window',
    'Socket',
    'Action',
    'ngDialog',
    'Storages',
    'Constants',
    'Socialshare',
    'UserApi',
    '$translate'
  ];

  function PollsListController(
    $location,
    $rootScope,
    $state,
    $scope,
    $window,
    Socket,
    Action,
    dialog,
    Storages,
    Constants,
    Socialshare,
    UserApi,
    $translate
  ) {
    var vm = this;

    vm.polls = [];
    vm.hot_polls = [];
    vm.bookmarks = [];
    vm.bestUsers = [];
    vm.tags = [];
    vm.new_data = [];
    vm.page = 0;
    vm.busy = false;
    vm.stopped = false;
    vm.is_has_new_polls = false;
    vm.supportLanguages = $window.supportLanguages;

    init();

    function init() {
      // Lắng nghe sự liện từ socket
      initSocket();
      // Load danh sách tags (Bao gồm số poll)
      get_popular_tags();
      // Load các polls có lượng like nhiều nhất
      get_populars();
      // Load các polls có lượng like nhiều nhất
      get_best_users();
      // Load danh sách poll đã bookmark
      if ($scope.isLogged) {
        // Lắng nghe sự kiện từ rootScope;
        // get_bookmarks();
      }
    }

    function initSocket() {
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

    vm.get_polls = get_polls;
    function get_polls() {
      if (vm.stopped || vm.busy) return;
      vm.busy = true;
      if (Storages.has_session(Constants.storages.polls)) {

      }
      Action.get_polls(vm.page)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            vm.stopped = true;
            vm.busy = false;
            return;
          }
          // Xử lý poll trước khi hiển thị màn hình
          var promises = [];
          res.data.forEach(poll => {
            promises.push(process_before_show(poll));
          });
          return Promise.all(promises);
        })
        .then(results => {
          // Gán data vào list hiện tại
          results = results || [];
          vm.polls = _.union(vm.polls, results);
          vm.page += 1;
          vm.busy = false;
          $scope.$digest();
        })
        .catch(err => {
          vm.busy = false;
          vm.stopped = true;
          $scope.show_message('MS_CM_LOAD_ERROR', true);
        });
    }
    function process_before_show(poll) {
      return new Promise((resolve, reject) => {
        poll = Action.process_before_show(poll);
        return resolve(poll);
      });
    }
    function get_populars() {
      Action.get_populars(0)
        .then(res => {
          vm.populars = res.data;
        })
        .catch(err => {
          $scope.show_message('MS_CM_LOAD_ERROR', true);
        });
    }
    function get_popular_tags() {
      Action.get_popular_tags()
        .then(res => {
          vm.tags = res.data;
        })
        .catch(err => {
          $scope.show_message('MS_CM_LOAD_ERROR', true);
        });
    }
    function get_bookmarks() {
      UserApi.get_bookmarks($scope.user._id, 0)
        .then(res => {
          vm.bookmarks = res.data || [];
        }, err => {
          $scope.show_message('MS_CM_LOAD_ERROR', true);
        });
    }
    function get_best_users() {
      Action.get_best_users(10)
        .then(res => {
          console.log(res.data);
          vm.bestUsers = res.data;
        })
        .catch(err => {
          $scope.show_message('MS_CM_LOAD_ERROR', true);
        });
    }
    // Thao tác khác
    $scope.delete_poll = (poll) => {
      if (!poll.isCurrentUserOwner) {
        $scope.show_message('MS_CM_AUTH_ERROR', true);
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
        vm.polls = _.without(vm.polls, poll);
        Action.delete_poll(poll);
      }
    };
    $scope.report_poll = (poll) => {
      if (poll.reported) {
        $scope.show_message_params('MS_CM_REPORT_EXIST_ERROR', { title: poll.title }, true);
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
            $scope.show_message_params('MS_CM_REPORT_SUCCESS', { title: poll.title }, false);
          })
          .catch(err => {
            $scope.show_message('MS_CM_LOAD_ERROR', true);
          });
      }
    };
    $scope.bookmark_poll = (poll) => {
      if (poll.bookmarked) {
        $scope.show_message_params('MS_CM_BOOKMARK_EXIST_ERROR', { title: poll.title }, true);
        return;
      }
      Action.save_bookmark(poll._id)
        .then(res => {
          poll.bookmarked = (res) ? true : false;
          $scope.show_message_params('MS_CM_BOOKMARK_SUCCESS', { title: poll.title }, false);
        })
        .catch(err => {
          $scope.show_message('MS_CM_LOAD_ERROR', true);
        });
    };
    $scope.follow_poll = (poll) => {
      if (!$scope.isLogged) {
        $scope.show_message('MS_CM_LOGIN_ERROR', true);
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
          $scope.show_message('MS_CM_LOAD_ERROR', true);
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
        controllerAs: 'ctrl',
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
    // Share
    $scope.share = (poll, provider) => {
      var url = $location.absUrl() + '/' + poll.slug;
      // var url = 'http://notatsujapan.com';
      var text = poll.title;
      if (provider === 'facebook') {
        Socialshare.share({
          'provider': 'facebook',
          'attrs': {
            'socialshareUrl': url,
            'socialshareHashtags': 'hanhatlenh',
            'socialshareQuote': text,
            'socialshareMobileiframe': true,
            'socialshareText': text
          }
        });
      } else if (provider === 'google') {
        Socialshare.share({
          'provider': provider,
          'attrs': {
            'socialshareUrl': url
          }
        });
      } else {
        Socialshare.share({
          'provider': provider,
          'attrs': {
            'socialshareUrl': url,
            'socialshareHashtags': 'hanhatlenh',
            'socialshareText': text
          }
        });
      }
    };
  }
})();
