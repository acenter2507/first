'use strict';

angular.module('polls').controller('PollsSearchController', [
  '$location',
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
  function ($location, $scope, $state, Authentication, Categorys, Action, $stateParams, Storages, Constants, toast, dialog, Profile) {
    $scope.user = Authentication.user;
    $scope.isLogged = ($scope.user) ? true : false;
    $scope.detailToggle = -1;
    $scope.form = {};
    $scope.categorys = Categorys.query();

    $scope.condition = {};
    $scope.condition.key = $stateParams.key;
    $scope.condition.in = $stateParams.in;
    $scope.condition.status = $stateParams.status;
    $scope.condition.ctgr = $stateParams.ctgr;

    $scope.condition.cmt = $stateParams.cmt;
    $scope.condition.compare = $stateParams.compare;

    $scope.condition.created = $stateParams.created;
    $scope.condition.timing = $stateParams.timing;

    $scope.condition.sort = $stateParams.sort;
    $scope.condition.sortkind = $stateParams.sortkind;

    $scope.condition.by = $stateParams.by;
    if ($scope.condition.by) {
      $scope.selectedUser = Profile.get({ userId: $scope.condition.by });
    }
    $scope.search = () => {
      $state.go('search', $scope.condition);
    };

    $scope.busy = false;
    $scope.polls = [];
    $scope.sort = '-poll.created';
    excute();
    function excute() {
      if (check_params()) {
        $scope.busy = true;
        Action.search($scope.condition)
          .then(res => {
            $scope.polls = res.data;
            var promise = [];
            $scope.polls.forEach(function (item) {
              promise.push(get_owner_follow(item.poll));
              promise.push(get_reported(item.poll));
              promise.push(get_bookmarked(item.poll));
            }, this);
            return Promise.all(promise);
          })
          .then(res => {
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

    function get_owner_follow(poll) {
      return new Promise((resolve, reject) => {
        if (!$scope.isLogged) {
          poll.follow = {};
          return resolve();
        }
        Action.get_follow(poll._id)
          .then(res => {
            poll.follow = res.data || { poll: poll._id };
            return resolve(res.data);
          })
          .catch(err => {
            return reject(err);
          });
      });
    }
    function get_reported(poll) {
      return new Promise((resolve, reject) => {
        if (!$scope.isLogged) {
          poll.reported = false;
          return resolve();
        }
        Action.get_report(poll._id)
          .then(res => {
            poll.reported = (res.data) ? res.data : false;
            return resolve(res.data);
          })
          .catch(err => {
            return reject(err);
          });
      });
    }
    function get_bookmarked(poll) {
      return new Promise((resolve, reject) => {
        if (!$scope.isLogged) {
          poll.bookmarked = false;
          return resolve();
        }
        Action.get_bookmark(poll._id)
          .then(res => {
            poll.bookmarked = (res.data) ? res.data : false;
            return resolve(res.data);
          })
          .catch(err => {
            return reject(err);
          });
      });
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
      Storages.set_local(Constants.storages.preferences, JSON.stringify($scope.condition));
      $location.url($location.path());
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
        Action.save_report(poll._id, reason)
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
          poll.follow = res;
          if (poll.follow.following) {
            toast.success('You followed ' + poll.title, 'Success!');
          }
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    };
  }
]);
