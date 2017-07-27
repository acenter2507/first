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
  'toastr',
  'ngDialog',
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
  toast,
  dialog,
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
        toast.error('Load logins error: ' + err.message, 'Error!');
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
  function count_total_like(polls) {
    var cnt = 0;
    polls.forEach(poll => {
      cnt += poll.report.likeCnt;
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
        $scope.reportCnt = $scope.reports.length;
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
        toast.error('Load bereports error: ' + err.message, 'Error!');
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
        toast.error('Load suggests error: ' + err.message, 'Error!');
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
    $scope.message_title = 'Delete user!';
    $scope.message_content = 'Are you sure you want to delete this user?';
    $scope.dialog_type = 3;
    $scope.buton_label = 'delete';
    dialog.openConfirm({
      scope: $scope,
      templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
    }).then(() => {
      handle_confirm();
    }, reject => {
    });
    function handle_confirm() {
      $scope.user.$remove(function () {
        $state.go('admin.users.list');
      });
    }
  };

  $scope.delete_poll = poll => {
    $scope.message_title = 'Delete poll!';
    $scope.message_content = 'Are you sure you want to delete?';
    $scope.dialog_type = 3;
    $scope.buton_label = 'delete';
    dialog.openConfirm({
      scope: $scope,
      templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
    }).then(() => {
      handle_confirm();
    }, reject => {
    });
    function handle_confirm() {
      var rs_poll = new Polls({ _id: poll._id });
      $scope.polls = _.without($scope.polls, poll);
      $scope.figureOutItemsToDisplay_polls();
      rs_poll.$remove();
    }
  };
  $scope.delete_cmt = cmt => {
    $scope.message_title = 'Delete comment!';
    $scope.message_content = 'Are you sure you want to delete?';
    $scope.dialog_type = 3;
    $scope.buton_label = 'delete';
    dialog.openConfirm({
      scope: $scope,
      templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
    }).then(() => {
      handle_confirm();
    }, reject => {
    });
    function handle_confirm() {
      var rs_cmt = new Cmts({ _id: cmt._id });
      $scope.cmts = _.without($scope.cmts, cmt);
      $scope.figureOutItemsToDisplay_cmts();
      rs_cmt.$remove();
    }
  };
  $scope.delete_vote = vote => {
    $scope.message_title = 'Delete vote!';
    $scope.message_content = 'Are you sure you want to delete?';
    $scope.dialog_type = 3;
    $scope.buton_label = 'delete';
    dialog.openConfirm({
      scope: $scope,
      templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
    }).then(() => {
      handle_confirm();
    }, reject => {
    });
    function handle_confirm() {
      var rs_vote = new Votes({ _id: vote._id });
      $scope.votes = _.without($scope.votes, vote);
      $scope.figureOutItemsToDisplay_votes();
      rs_vote.$remove();
    }
  };
  $scope.delete_report = rp => {
    $scope.message_title = 'Delete report!';
    $scope.message_content = 'Are you sure you want to delete?';
    $scope.dialog_type = 3;
    $scope.buton_label = 'delete';
    dialog.openConfirm({
      scope: $scope,
      templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
    }).then(() => {
      handle_confirm();
    }, reject => {
    });
    function handle_confirm() {
      var rs_rp = new Reports({ _id: rp._id });
      $scope.reports = _.without($scope.reports, rp);
      $scope.figureOutItemsToDisplay_reports();
      rs_rp.$remove();
    }
  };
  $scope.delete_bereport = brp => {
    $scope.message_title = 'Delete report!';
    $scope.message_content = 'Are you sure you want to delete?';
    $scope.dialog_type = 3;
    $scope.buton_label = 'delete';
    dialog.openConfirm({
      scope: $scope,
      templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
    }).then(() => {
      handle_confirm();
    }, reject => {
    });
    function handle_confirm() {
      var rs_brp = new Reports({ _id: brp._id });
      $scope.bereports = _.without($scope.bereports, brp);
      $scope.figureOutItemsToDisplay_bereports();
      rs_brp.$remove();
    }
  };
  $scope.delete_suggest = sg => {
    $scope.message_title = 'Delete suggest!';
    $scope.message_content = 'Are you sure you want to delete?';
    $scope.dialog_type = 3;
    $scope.buton_label = 'delete';
    dialog.openConfirm({
      scope: $scope,
      templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
    }).then(() => {
      handle_confirm();
    }, reject => {
    });
    function handle_confirm() {
      var rs_sg = new Opts({ _id: sg._id });
      $scope.suggests = _.without($scope.suggests, sg);
      $scope.figureOutItemsToDisplay_suggests();
      rs_sg.$remove();
    }
  };
}