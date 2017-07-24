'use strict';
angular.module('admin')
  .controller('ViewUserController', ViewUserController);
ViewUserController.$inject = ['$window', '$timeout', '$scope', '$state', '$filter', 'Authentication', 'userResolve', 'AdminApi', 'Action', 'toastr', 'ngDialog'];


function ViewUserController($window, $timeout, $scope, $state, $filter, Authentication, userResolve, AdminApi, Action, toast, dialog) {
  $scope.authentication = Authentication;
  $scope.loginCnt = 0;
  $scope.pollCnt = 0;
  $scope.cmtCnt = 0;
  $scope.voteCnt = 0;
  $scope.reportCnt = 0;
  $scope.bereportCnt = 0;
  $scope.likeCnt = 0;
  $scope.suggestCnt = 0;
  $scope.itemsPerPage = 15;

  $scope.user = userResolve;
  /* User basic info control */
  $scope.filter_min = true;

  /* Polls */
  get_polls();
  function get_polls() {
    AdminApi.get_polls_by_user($scope.user._id)
      .then(res => {
        $scope.polls = res.data || [];
        $scope.pollCnt = $scope.polls.length;
        $scope.buildPollPager();
      })
      .catch(err => {
        toast.error('Load polls error: ' + err.message, 'Error!');
      });
  }
  $scope.buildPollPager = () => {
    $scope.pollsPagedItems = [];
    $scope.pollsCurrentPage = 1;
    $scope.figureOutItemsToDisplay_polls();
  };
  $scope.figureOutItemsToDisplay_polls = function () {
    let filteredItems = $filter('filter')($scope.polls, {
      $: $scope.pollSearch
    }) || [];

    $scope.pollFilterLength = filteredItems.length;
    var begin = (($scope.pollsCurrentPage - 1) * $scope.itemsPerPage);
    var end = begin + $scope.itemsPerPage;
    $scope.pollsPagedItems = filteredItems.slice(begin, end);
  };

  $scope.pollPageChanged = function () {
    $scope.figureOutItemsToDisplay_polls();
  };

  /* Votes */
  get_votes();
  function get_votes() {
    AdminApi.get_votes_by_user($scope.user._id)
      .then(res => {
        $scope.votes = res.data || [];
        $scope.voteCnt = $scope.votes.length;
        console.log(res);
        $scope.buildVotePager();
      })
      .catch(err => {
        toast.error('Load votes error: ' + err.message, 'Error!');
      });
  }
  $scope.buildVotePager = () => {
    $scope.votesPagedItems = [];
    $scope.votesCurrentPage = 1;
    $scope.figureOutItemsToDisplay_votes();
  };
  $scope.figureOutItemsToDisplay_votes = function () {
    let filteredItems = $filter('filter')($scope.votes, {
      $: $scope.voteSearch
    }) || [];

    $scope.voteFilterLength = filteredItems.length;
    var begin = (($scope.votesCurrentPage - 1) * $scope.itemsPerPage);
    var end = begin + $scope.itemsPerPage;
    $scope.votesPagedItems = filteredItems.slice(begin, end);
  };
  $scope.votePageChanged = function () {
    $scope.figureOutItemsToDisplay_votes();
  };

  $scope.remove = function (user) {
    if (confirm('Are you sure you want to delete this user?')) {
      if (user) {
        user.$remove();

        $scope.users.splice($scope.users.indexOf(user), 1);
      } else {
        $scope.user.$remove(function () {
          $state.go('admin.users.list');
        });
      }
    }
  };
}
