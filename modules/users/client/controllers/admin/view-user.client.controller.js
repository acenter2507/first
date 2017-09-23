'use strict';
angular.module('admin')
  .controller('ViewUserController', ViewUserController);
ViewUserController.$inject = [
  '$window',
  '$timeout',
  '$scope',
  '$state',
  '$filter',
  'Authentication',
  'userResolve',
  'AdminApi',
  'Action',
  'PollsService',
  'CmtsService',
  'VotesService',
  'ReportsService',
  'OptsService'
];


function ViewUserController(
  $window,
  $timeout,
  $scope,
  $state,
  $filter,
  Authentication,
  userResolve,
  AdminApi,
  Action,
  Polls,
  Cmts,
  Votes,
  Reports,
  Opts
) {
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
  $scope.logins = [];
  $scope.polls = [];
  $scope.cmts = [];
  $scope.votes = [];
  $scope.reports = [];
  $scope.bereports = [];
  $scope.suggests = [];
  /* User basic info control */
  $scope.filter_min = true;

  /* Login log */
  get_logins();
  function get_logins() {
    AdminApi.get_logins_by_user($scope.user._id)
      .then(res => {
        $scope.logins = res.data || [];
        $scope.loginCnt = $scope.logins.length;
        $scope.buildloginPager();
      })
      .catch(err => {
        alert(err.message);
      });
  }
  $scope.buildloginPager = () => {
    $scope.loginsPagedItems = [];
    $scope.loginsCurrentPage = 1;
    $scope.figureOutItemsToDisplay_logins();
  };
  $scope.figureOutItemsToDisplay_logins = function () {
    let filteredItems = $scope.logins;

    $scope.loginFilterLength = filteredItems.length;
    var begin = (($scope.loginsCurrentPage - 1) * $scope.itemsPerPage);
    var end = begin + $scope.itemsPerPage;
    $scope.loginsPagedItems = filteredItems.slice(begin, end);
  };
  $scope.loginPageChanged = function () {
    $scope.figureOutItemsToDisplay_logins();
  };

  /* Polls */
  get_polls();
  function get_polls() {
    AdminApi.get_polls_by_user($scope.user._id)
      .then(res => {
        $scope.polls = res.data || [];
        $scope.pollCnt = $scope.polls.length;
        $scope.likeCnt = count_total_like($scope.polls);
        $scope.buildPollPager();
      })
      .catch(err => {
        alert(err.message);
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
  function count_total_like(polls) {
    var cnt = 0;
    polls.forEach(poll => {
      cnt += poll.likeCnt;
    });
    return cnt;
  }

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
        alert(err.message);
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
        alert(err.message);
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
        $scope.reportCnt = $scope.reports.length;
        $scope.buildReportPager();
      })
      .catch(err => {
        alert(err.message);
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

  /* Be reports */
  get_bereports();
  function get_bereports() {
    AdminApi.get_bereports_by_user($scope.user._id)
      .then(res => {
        $scope.bereports = res.data || [];
        $scope.bereportCnt = $scope.bereports.length;
        $scope.buildBereportPager();
      })
      .catch(err => {
        alert(err.message);
      });
  }
  $scope.buildBereportPager = () => {
    $scope.bereportsPagedItems = [];
    $scope.bereportsCurrentPage = 1;
    $scope.figureOutItemsToDisplay_bereports();
  };
  $scope.figureOutItemsToDisplay_bereports = function () {
    let filteredItems = $filter('filter')($scope.bereports, {
      $: $scope.bereportSearch
    }) || [];

    $scope.bereportFilterLength = filteredItems.length;
    var begin = (($scope.bereportsCurrentPage - 1) * $scope.itemsPerPage);
    var end = begin + $scope.itemsPerPage;
    $scope.bereportsPagedItems = filteredItems.slice(begin, end);
  };
  $scope.bereportPageChanged = function () {
    $scope.figureOutItemsToDisplay_bereports();
  };


  /* Suggested */
  get_suggests();
  function get_suggests() {
    AdminApi.get_suggests_by_user($scope.user._id)
      .then(res => {
        $scope.suggests = res.data || [];
        $scope.suggestCnt = $scope.suggests.length;
        $scope.buildSuggestPager();
      })
      .catch(err => {
        alert(err.message);
      });
  }
  $scope.buildSuggestPager = () => {
    $scope.suggestsPagedItems = [];
    $scope.suggestsCurrentPage = 1;
    $scope.figureOutItemsToDisplay_suggests();
  };
  $scope.figureOutItemsToDisplay_suggests = function () {
    let filteredItems = $filter('filter')($scope.suggests, {
      $: $scope.suggestSearch
    }) || [];

    $scope.suggestFilterLength = filteredItems.length;
    var begin = (($scope.suggestsCurrentPage - 1) * $scope.itemsPerPage);
    var end = begin + $scope.itemsPerPage;
    $scope.suggestsPagedItems = filteredItems.slice(begin, end);
  };
  $scope.suggestPageChanged = function () {
    $scope.figureOutItemsToDisplay_suggests();
  };

  $scope.remove = () => {
    if ($window.confirm('Delete this user?')) {
      $scope.user.$remove(function () {
        $state.go('admin.users.list');
      });
    }
  };

  $scope.delete_poll = poll => {
    if ($window.confirm('Delete this poll?')) {
      var rs_poll = new Polls({ _id: poll._id });
      $scope.polls = _.without($scope.polls, poll);
      $scope.figureOutItemsToDisplay_polls();
      rs_poll.$remove();
    }
  };
  $scope.delete_cmt = cmt => {
    if ($window.confirm('Delete this comment?')) {
      var rs_cmt = new Cmts({ _id: cmt._id });
      $scope.cmts = _.without($scope.cmts, cmt);
      $scope.figureOutItemsToDisplay_cmts();
      rs_cmt.$remove();
    }
  };
  $scope.delete_vote = vote => {
    if ($window.confirm('Delete this vote?')) {
      var rs_vote = new Votes({ _id: vote._id });
      $scope.votes = _.without($scope.votes, vote);
      $scope.figureOutItemsToDisplay_votes();
      rs_vote.$remove();
    }
  };
  $scope.delete_report = rp => {
    if ($window.confirm('Delete this report?')) {
      var rs_rp = new Reports({ _id: rp._id });
      $scope.reports = _.without($scope.reports, rp);
      $scope.figureOutItemsToDisplay_reports();
      rs_rp.$remove();
    }
  };
  $scope.delete_bereport = brp => {
    if ($window.confirm('Delete this bereport?')) {
      var rs_brp = new Reports({ _id: brp._id });
      $scope.bereports = _.without($scope.bereports, brp);
      $scope.figureOutItemsToDisplay_bereports();
      rs_brp.$remove();
    }
  };
  $scope.delete_suggest = sg => {
    if ($window.confirm('Delete this bereport?')) {
      var rs_sg = new Opts({ _id: sg._id });
      $scope.suggests = _.without($scope.suggests, sg);
      $scope.figureOutItemsToDisplay_suggests();
      rs_sg.$remove();
    }
  };
}