'use strict';

angular.module('users').controller('ProfileLikesController', [
  '$scope',
  'UserApi',
  'Action',
  'ngDialog',
  'toastr',
  function($scope, UserApi, Action, dialog, toast) {
    $scope.polls = [];
    $scope.page = 0;
    $scope.busy = false;
    $scope.stopped = false;
    $scope.new_data = [];

    init();

    function init() {
      // get_polls();
    }

    $scope.get_polls = get_polls;
    function get_polls() {
      if ($scope.busy || $scope.stopped) {
        return;
      }
      $scope.busy = true;
      UserApi.get_likes($scope.profile._id, $scope.page)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            $scope.busy = false;
            $scope.stopped = true;
            return;
          }
          res.data.forEach(item => {
            if (item.poll) {
              $scope.new_data.push(item.poll);
            }
          });
          var promises = [];
          $scope.new_data.forEach(poll => {
            poll.isCurrentUserOwner = $scope.isLogged && $scope.user._id === poll.user._id;
            promises.push(get_poll_report(poll));
            promises.push(get_opts(poll));
          });
          return Promise.all(promises);
        })
        .then(res => {
          // Gán data vào list hiện tại
          $scope.polls = _.union($scope.polls, $scope.new_data);
          $scope.page += 1;
          $scope.busy = false;
          $scope.new_data = [];
        })
        .catch(err => {
          $scope.busy = false;
          $scope.stopped = true;
          toast.error(err.message, 'Error!');
        });
    }
    function get_poll_report(poll) {
      return new Promise((resolve, reject) => {
        Action.get_poll_report(poll._id)
          .then(res => {
            poll.report = res.data;
            return resolve(res);
          })
          .catch(err => {
            return reject(err);
          });
      });
    }
    function get_opts(poll) {
      return new Promise((resolve, reject) => {
        Action.get_opts(poll._id)
          .then(res => {
            poll.opts = _.where(res.data, { status: 1 }) || [];
            return get_vote_for_poll(poll);
          })
          .then(res => {
            return resolve(poll);
          })
          .catch(err => {
            return reject(err);
          });
      });
    }
    function get_vote_for_poll(poll) {
      return new Promise((resolve, reject) => {
        Action.get_voteopts(poll._id)
          .then(res => {
            poll.chart = {
              options: { responsive: true },
              colors: [],
              labels: [],
              data: []
            };
            poll.votes = res.data.votes || [];
            poll.voteopts = res.data.voteopts || [];
            poll.total = poll.voteopts.length;
            poll.opts.forEach(opt => {
              opt.voteCnt = _.where(poll.voteopts, { opt: opt._id }).length || 0;
              opt.progressVal = calPercen(poll.total, opt.voteCnt);
              poll.chart.data.push(opt.voteCnt);
              poll.chart.colors.push(opt.color);
              poll.chart.labels.push(opt.title);
            });
            return resolve(poll);
          })
          .catch(err => {
            return reject(err);
          });
      });
    }
    $scope.poll_filter = poll => {
      if (poll.isPublic) {
        return true;
      } else {
        return $scope.isCurrentOwner;
      }
    };
    // Tính phần trăm tỉ lệ vote cho opt
    function calPercen(total, value) {
      if (total === 0) {
        return 0;
      }
      return Math.floor(value * 100 / total) || 0;
    }
  }
]);
