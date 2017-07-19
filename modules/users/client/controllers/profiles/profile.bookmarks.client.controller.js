'use strict';

angular.module('users').controller('ProfileBookmarksController', [
  '$scope',
  'UserApi',
  'Action',
  'toastr',
  function($scope, UserApi, Action, toast) {
    $scope.polls = [];
    $scope.page = 0;
    $scope.busy = false;
    $scope.stopped = false;
    $scope.new_data = [];

    $scope.get_polls = get_polls;
    function get_polls() {
      if ($scope.busy || $scope.stopped) {
        return;
      }
      $scope.busy = true;
      UserApi.get_bookmarks($scope.profile._id, $scope.page)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            $scope.busy = false;
            $scope.stopped = true;
            return;
          }
          $scope.new_data = res.data || [];
          var promises = [];
          $scope.new_data.forEach(poll => {
            poll.isCurrentUserOwner = $scope.isLogged && $scope.user._id === poll.user._id;
            promises.push(get_poll_report(poll));
            promises.push(get_opts(poll));
            promises.push(get_owner_follow(poll));
            promises.push(get_reported(poll));
            promises.push(get_bookmarked(poll));
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

    // $scope.get_polls = get_polls;
    // function get_polls() {
    //   if ($scope.busy || $scope.stopped) {
    //     return;
    //   }
    //   $scope.busy = true;
    //   UserApi.get_bookmarks($scope.profile._id, $scope.page)
    //     .success(res => {
    //       if (!res || !res.length || res.length === 0) {
    //         $scope.busy = false;
    //         $scope.stopped = true;
    //         return;
    //       }
    //       res.forEach(item => {
    //         if (item.poll) {
    //           $scope.new_data.push(item.poll);
    //         }
    //       });
    //       var promises = [];
    //       $scope.new_data.forEach(poll => {
    //         poll.chart = {
    //           options: { responsive: true },
    //           colors: [],
    //           labels: [],
    //           data: []
    //         };
    //         promises.push(get_opts(poll));
    //       });
    //       Promise.all(promises)
    //         .then(res => {
    //           var promises = [];
    //           $scope.new_data.forEach(poll => {
    //             promises.push(get_voteOpts(poll));
    //           });
    //           return Promise.all(promises);
    //         })
    //         .then(res => {
    //           // Gán data vào list hiện tại
    //           $scope.polls = _.union($scope.polls, $scope.new_data);
    //           $scope.page += 1;
    //           $scope.busy = false;
    //           $scope.$apply();

    //           console.log(
    //             'Load new success: ' + $scope.new_data.length + ' polls'
    //           );
    //           $scope.new_data = [];
    //         })
    //         .catch(err => {
    //           alert(err);
    //         });
    //     })
    //     .error(err => {
    //       alert(err);
    //     });
    // }
    // function get_opts(poll) {
    //   return new Promise((resolve, reject) => {
    //     Action.get_opts(poll._id)
    //       .then(res => {
    //         poll.opts = _.where(res.data, { status: 1 }) || [];
    //         return resolve(poll);
    //       })
    //       .catch(err => {
    //         return reject(err);
    //       });
    //   });
    // }
    // function get_voteOpts(poll) {
    //   return new Promise((resolve, reject) => {
    //     Action.get_voteopts(poll._id)
    //       .then(res => {
    //         poll.votes = res.data.votes || [];
    //         poll.voteopts = res.data.voteopts || [];
    //         poll.total = poll.voteopts.length;
    //         poll.opts.forEach(opt => {
    //           opt.voteCnt =
    //             _.where(poll.voteopts, { opt: opt._id }).length || 0;
    //           opt.progressVal = calPercen(poll.total, opt.voteCnt);
    //           poll.chart.data.push(opt.voteCnt);
    //           poll.chart.colors.push(opt.color);
    //           poll.chart.labels.push(opt.title);
    //         });
    //         return resolve(poll);
    //       })
    //       .catch(err => {
    //         return reject(err);
    //       });
    //   });
    // }
    // $scope.poll_filter = poll => {
    //   if (poll.isPublic) {
    //     return true;
    //   } else {
    //     return $scope.isCurrentOwner;
    //   }
    // };
    // // Tính phần trăm tỉ lệ vote cho opt
    // function calPercen(total, value) {
    //   if (total === 0) {
    //     return 0;
    //   }
    //   return Math.floor(value * 100 / total) || 0;
    // }
  }
]);
