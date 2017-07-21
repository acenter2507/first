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
  function ($location, $scope, $state, Authentication, Categorys, Action, $stateParams, Storages, Constants) {
    $scope.user = Authentication.user;
    $scope.isLogged = ($scope.user) ? true : false;
    $scope.detailToggle = -1;
    $scope.form = {};
    $scope.categorys = Categorys.query();

    $scope.condition = {};
    $scope.condition.key = $stateParams.key;
    $scope.condition.in = $stateParams.in;
    $scope.condition.status = $stateParams.status;
    $scope.condition.by = $stateParams.by;
    $scope.condition.ctgr = $stateParams.ctgr;

    $scope.condition.cmt = $stateParams.cmt;
    $scope.condition.compare = $stateParams.compare;

    $scope.condition.created = $stateParams.created;
    $scope.condition.timing = $stateParams.timing;

    $scope.condition.sort = $stateParams.sort;
    $scope.condition.sortkind = $stateParams.sortkind;

    $scope.search = () => {
      $state.go('search', $scope.condition);
    };

    $scope.busy = false;
    $scope.polls = [];
    $scope.sort;
    excute();
    function excute() {
      if (check_params()) {
        $scope.busy = true;
        Action.search($scope.condition)
          .then(res => {
            console.log(res);
            $scope.polls = res.data;
            var promise = [];
            $scope.polls.forEach(function(item) {
              promise.push(get_owner_follow(item.poll));
              promise.push(get_reported(item.poll));
              promise.push(get_bookmarked(item.poll));
            }, this);
          })
          .then(res => {
            $scope.busy = false;
          })
          .catch(err => {
            console.log(err);
            $scope.busy = false;
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

    function get_owner_follow(poll) {
      return new Promise((resolve, reject) => {
        if (!vm.isLogged) {
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
        if (!vm.isLogged) {
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
        if (!vm.isLogged) {
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
    $scope.clear_preferences = () => {
      $scope.condition = {};
      Storages.set_local(Constants.storages.preferences, JSON.stringify($scope.condition));
      $location.url($location.path());
    };
    $scope.save_preferences = () => {
      Storages.set_local(Constants.storages.preferences, JSON.stringify($scope.condition));
    };
  }
]);
