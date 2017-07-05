'use strict';

angular.module('users').controller('ProfileFollowsController', [
  '$scope',
  'UserApi',
  'Action',
  function($scope, UserApi, Action) {
    $scope.polls = [];
    $scope.page = 0;
    $scope.busy = false;
    $scope.stoped = false;
    $scope.new_data = [];

    init();

    function init() {
      get_polls();
    }

    $scope.get_polls = get_polls;
    function get_polls() {
      if ($scope.busy || $scope.stoped) {
        return;
      }
      $scope.busy = true;
      UserApi.get_follows($scope.profile._id, $scope.page)
        .success(res => {
          if (!res || !res.length || res.length === 0) {
            $scope.busy = false;
            $scope.stoped = true;
            return;
          }
          console.log(res);
          $scope.new_data = _.pluck(res, 'poll') || [];
          var promises = [];
          $scope.new_data.forEach(poll => {
            poll.chart = {
              options: { responsive: true },
              colors: [],
              labels: [],
              data: []
            };
            promises.push(get_opts(poll));
          });
          Promise.all(promises)
            .then(res => {
              var promises = [];
              $scope.new_data.forEach(poll => {
                promises.push(get_voteOpts(poll));
              });
              return Promise.all(promises);
            })
            .then(res => {
              // Gán data vào list hiện tại
              $scope.polls = _.union($scope.polls, $scope.new_data);
              $scope.page += 1;
              $scope.busy = false;
              $scope.$apply();

              console.log(
                'Load new success: ' + $scope.new_data.length + ' polls'
              );
              $scope.new_data.length = [];
            })
            .catch(err => {
              alert(err);
            });
        })
        .error(err => {
          alert(err);
        });
    }
    function get_opts(poll) {
      return new Promise((resolve, reject) => {
        Action.get_opts(poll._id)
          .then(res => {
            poll.opts = _.where(res.data, { status: 1 }) || [];
            return resolve(poll);
          })
          .catch(err => {
            return reject(err);
          });
      });
    }
    function get_voteOpts(poll) {
      return new Promise((resolve, reject) => {
        Action.get_voteopts(poll._id)
          .then(res => {
            poll.votes = res.data.votes || [];
            poll.voteopts = res.data.voteopts || [];
            poll.total = poll.voteopts.length;
            poll.opts.forEach(opt => {
              opt.voteCnt =
                _.where(poll.voteopts, { opt: opt._id }).length || 0;
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
