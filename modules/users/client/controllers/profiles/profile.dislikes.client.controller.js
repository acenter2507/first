'use strict';

angular.module('users').controller('ProfileDislikesController', [
  '$scope',
  'UserApi',
  'Action',
  'toastr',
  function ($scope, UserApi, Action, toast) {
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
      UserApi.get_dislikes($scope.profile._id, $scope.page)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            $scope.busy = false;
            $scope.stopped = true;
            return;
          }
          $scope.new_data = res.data || [];
          var promises = [];
          $scope.new_data.forEach(poll => {
            promises.push(process_before_show(poll));
          });
          return Promise.all(promises);
        })
        .then(results => {
          // Gán data vào list hiện tại
          $scope.polls = _.union($scope.polls, results);
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
    function process_before_show(poll) {
      return new Promise((resolve, reject) => {
        poll.isCurrentUserOwner = $scope.isLogged && $scope.user._id === poll.user._id;
        poll.chart = {
          options: { responsive: true },
          colors: [],
          labels: [],
          data: []
        };
        poll.total = poll.voteopts.length;
        poll.opts.forEach(opt => {
          opt.voteCnt = _.where(poll.voteopts, { opt: opt._id }).length || 0;
          opt.progressVal = calPercen(poll.total, opt.voteCnt);
          poll.chart.data.push(opt.voteCnt);
          poll.chart.colors.push(opt.color);
          poll.chart.labels.push(opt.title);
        });
        return resolve(poll);
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
