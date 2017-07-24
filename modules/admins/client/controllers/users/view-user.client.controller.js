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
  $scope.polls = [];
  $scope.cmts = [];
  $scope.votes = [];
  $scope.reports = [];
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

  /* Comments */
  get_cmts();
  function get_cmts() {
    AdminApi.get_cmts_by_user($scope.user._id)
      .then(res => {
        $scope.cmts = res.data || [];
        $scope.cmtCnt = $scope.cmts.length;
        $scope.buildCmtPager();
      })
      .catch(err => {
        toast.error('Load cmts error: ' + err.message, 'Error!');
      });
  }
  $scope.buildCmtPager = () => {
    $scope.cmtsPagedItems = [];
    $scope.cmtsCurrentPage = 1;
    $scope.figureOutItemsToDisplay_cmts();
  };
  $scope.figureOutItemsToDisplay_cmts = function () {
    let filteredItems = $filter('filter')($scope.cmts, {
      $: $scope.cmtSearch
    }) || [];

    $scope.cmtFilterLength = filteredItems.length;
    var begin = (($scope.cmtsCurrentPage - 1) * $scope.itemsPerPage);
    var end = begin + $scope.itemsPerPage;
    $scope.cmtsPagedItems = filteredItems.slice(begin, end);
  };
  $scope.cmtPageChanged = function () {
    $scope.figureOutItemsToDisplay_cmts();
  };

  /* Votes */
  get_votes();
  function get_votes() {
    AdminApi.get_votes_by_user($scope.user._id)
      .then(res => {
        $scope.votes = res.data || [];
        $scope.voteCnt = $scope.votes.length;
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

  /* Reports */
  get_reports();
  function get_reports() {
    AdminApi.get_reports_by_user($scope.user._id)
      .then(res => {
        $scope.reports = res.data || [];
        $scope.voteCnt = $scope.reports.length;
        $scope.buildReportPager();
      })
      .catch(err => {
        toast.error('Load reports error: ' + err.message, 'Error!');
      });
  }
  $scope.buildReportPager = () => {
    $scope.reportsPagedItems = [];
    $scope.reportsCurrentPage = 1;
    $scope.figureOutItemsToDisplay_reports();
  };
  $scope.figureOutItemsToDisplay_reports = function () {
    let filteredItems = $filter('filter')($scope.reports, {
      $: $scope.reportSearch
    }) || [];

    $scope.reportFilterLength = filteredItems.length;
    var begin = (($scope.reportsCurrentPage - 1) * $scope.itemsPerPage);
    var end = begin + $scope.itemsPerPage;
    $scope.reportsPagedItems = filteredItems.slice(begin, end);
  };
  $scope.reportPageChanged = function () {
    $scope.figureOutItemsToDisplay_reports();
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
