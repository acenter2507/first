'use strict';
angular.module('users.admin')
  .controller('AdminViewUserController', AdminViewUserController);
AdminViewUserController.$inject = [
  '$window',
  '$document',
  '$scope',
  '$state',
  '$filter',
  'userResolve',
  'AdminUserApi',
  'AdminUserService',
  'Action',
  'CmtsService',
  'VotesService',
  'ReportsService',
  'OptsService'
];


function AdminViewUserController(
  $window,
  $document,
  $scope,
  $state,
  $filter,
  userResolve,
  AdminUserApi,
  AdminUserService,
  Action,
  CmtsService,
  VotesService,
  Reports,
  Opts
) {
  var vm = this;
  vm.user = userResolve;

  onCreate();

  function onCreate() {
  }

  /**
   * HANDLES
   */
  //-------------- LOGINS
  vm.handleViewListLogin = () => {
    if (vm.login) {
      let login = angular.element(document.getElementById('login-table'));
      $document.scrollToElementAnimated(login, 100);
    } else {
      vm.login = {};
      vm.login.page = 1;
      vm.login.condition = {};
      handleLoadUserLoginInfo();
      return;
    }
  };
  vm.handleLoginPageChanged = page => {
    vm.login.page = page;
    handleLoadUserLoginInfo();
  };
  function handleLoadUserLoginInfo() {
    AdminUserApi.loadAdminUserLogins(vm.user._id, vm.login.page, vm.login.condition)
      .success(res => {
        vm.login.data = res.docs;
        vm.login.pages = createArrayFromRange(res.pages);
        vm.login.total = res.total;
        vm.handleViewListLogin();
      })
      .error(err => {
        alert(err.message);
        console.log(err);
      });
  }

  //-------------- POLLS
  vm.handleViewListPolls = () => {
    if (vm.polls) {
      let poll = angular.element(document.getElementById('polls-table'));
      $document.scrollToElementAnimated(poll, 100);
    } else {
      vm.polls = {};
      vm.polls.page = 1;
      vm.polls.condition = {};
      handleLoadUserPolls();
      return;
    }
  };
  vm.handlePollsPageChanged = page => {
    vm.polls.page = page;
    handleLoadUserPolls();
  };
  function handleLoadUserPolls() {
    AdminUserApi.loadAdminUserPolls(vm.user._id, vm.polls.page, vm.polls.condition)
      .success(res => {
        vm.polls.data = res.docs;
        vm.polls.pages = createArrayFromRange(res.pages);
        vm.polls.total = res.total;
        vm.handleViewListPolls();
      })
      .error(err => {
        alert(err.message);
        console.log(err);
      });
  }

  //-------------- COMMENTS
  vm.handleViewListComments = () => {
    if (vm.cmts) {
      let cmts = angular.element(document.getElementById('comments-table'));
      $document.scrollToElementAnimated(cmts, 100);
    } else {
      vm.cmts = {};
      vm.cmts.page = 1;
      vm.cmts.condition = {};
      handleLoadUserComments();
      return;
    }
  };
  vm.handleCommentsPageChanged = page => {
    vm.cmts.page = page;
    handleLoadUserComments();
  };
  vm.handleDeleteComment = cmt => {
    var comment = new CmtsService({ _id: cmt._id });
    vm.cmts.data = _.without(vm.cmts.data, cmt);
    comment.$remove();
  };
  function handleLoadUserComments() {
    AdminUserApi.loadAdminUserComments(vm.user._id, vm.cmts.page, vm.cmts.condition)
      .success(res => {
        vm.cmts.data = res.docs;
        vm.cmts.pages = createArrayFromRange(res.pages);
        vm.cmts.total = res.total;
        vm.handleViewListComments();
      })
      .error(err => {
        alert(err.message);
        console.log(err);
      });
  }

  //-------------- VOTES
  vm.handleViewListVotes = () => {
    if (vm.votes) {
      let votes = angular.element(document.getElementById('votes-table'));
      $document.scrollToElementAnimated(votes, 100);
    } else {
      vm.votes = {};
      vm.votes.page = 1;
      vm.votes.condition = {};
      handleLoadUserVotes();
      return;
    }
  };
  vm.handleVotesPageChanged = page => {
    vm.votes.page = page;
    handleLoadUserVotes();
  };
  vm.handleDeleteVote = vote => {
    var rsVote = new VotesService({ _id: vote._id });
    vm.votes.data = _.without(vm.votes.data, vote);
    rsVote.$remove();
  };
  function handleLoadUserVotes() {
    AdminUserApi.loadAdminUserVotes(vm.user._id, vm.votes.page, vm.votes.condition)
      .success(res => {
        vm.votes.data = res.docs;
        vm.votes.pages = createArrayFromRange(res.pages);
        vm.votes.total = res.total;
        vm.handleViewListVotes();
      })
      .error(err => {
        alert(err.message);
        console.log(err);
      });
  }

  //-------------- LIKES
  vm.handleViewListLikes = () => {
    if (vm.likes) {
      let likes = angular.element(document.getElementById('likes-table'));
      $document.scrollToElementAnimated(likes, 100);
    } else {
      vm.likes = {};
      vm.likes.page = 1;
      vm.likes.condition = {};
      handleLoadUserLikes();
      return;
    }
  };
  vm.handleLikesPageChanged = page => {
    vm.likes.page = page;
    handleLoadUserLikes();
  };
  function handleLoadUserLikes() {
    AdminUserApi.loadAdminUserLikes(vm.user._id, vm.likes.page, vm.likes.condition)
      .success(res => {
        vm.likes.data = res.docs;
        vm.likes.pages = createArrayFromRange(res.pages);
        vm.likes.total = res.total;
        vm.handleViewListLikes();
      })
      .error(err => {
        alert(err.message);
        console.log(err);
      });
  }

  //-------------- SUGGESTEDS
  vm.handleViewListSuggests = () => {
    if (vm.suggests) {
      let suggests = angular.element(document.getElementById('suggests-table'));
      $document.scrollToElementAnimated(suggests, 100);
    } else {
      vm.suggests = {};
      vm.suggests.page = 1;
      vm.suggests.condition = {};
      handleLoadUserSuggests();
      return;
    }
  };
  vm.handleSuggestsPageChanged = page => {
    vm.suggests.page = page;
    handleLoadUserSuggests();
  };
  function handleLoadUserSuggests() {
    AdminUserApi.loadAdminUserSuggests(vm.user._id, vm.suggests.page, vm.suggests.condition)
      .success(res => {
        vm.suggests.data = res.docs;
        vm.suggests.pages = createArrayFromRange(res.pages);
        vm.suggests.total = res.total;
        vm.handleViewListSuggests();
      })
      .error(err => {
        alert(err.message);
        console.log(err);
      });
  }

  
  vm.handleViewListSuggests = () => {

  };
  vm.handleViewListReports = () => {

  };
  vm.handleViewListBeReports = () => {

  };

  vm.handleDeleteUser = () => {
    if ($window.confirm('Are you sure you want to delete?')) {
      var rs_user = new AdminUserService({ _id: vm.user._id });
      rs_user.$remove(() => {
        $state.go('admin.users.list');
      });
    }
  };
  vm.handleBlockUser = () => {
    if ($window.confirm('Are you sure you want to block?')) {
      var rs_user = new AdminUserService({ _id: vm.user._id });
      rs_user.status = 3;
      rs_user.$update(() => {
        alert('Done');
      });
    }
  };
  vm.handleUnBlockUser = () => {
    if ($window.confirm('Are you sure you want to unblock?')) {
      var rs_user = new AdminUserService({ _id: vm.user._id });
      rs_user.status = 2;
      rs_user.$update(() => {
        alert('Done');
      });
    }
  };
  vm.handleResetPassword = () => {
    var pass = $window.prompt('Enter new password:');
    if (!pass) return;
    if (pass === '' || pass.length < 8 || pass.length > 32)
      return alert('Password failed.');
    AdminUserApi.resetUserPassword(vm.user._id, pass)
      .success(res => {
        alert('Done');
      })
      .error(err => {
        console.log(err);
        alert(err.message);
      });
  };
  vm.handlePushVerify = () => {
  };
  function createArrayFromRange(range) {
    var array = [];
    for (var i = 1; i <= range; i++) {
      array.push(i);
    }
    return array;
  }






















  // $scope.loginCnt = 0;
  // $scope.pollCnt = 0;
  // $scope.cmtCnt = 0;
  // $scope.voteCnt = 0;
  // $scope.reportCnt = 0;
  // $scope.bereportCnt = 0;
  // $scope.likeCnt = 0;
  // $scope.suggestCnt = 0;
  // $scope.itemsPerPage = 15;

  // $scope.logins = [];
  // $scope.polls = [];
  // $scope.cmts = [];
  // $scope.votes = [];
  // $scope.reports = [];
  // $scope.bereports = [];
  // $scope.suggests = [];
  // /* User basic info control */
  // $scope.filter_min = true;

  /**
   * PREPARE
   */

  /* Login log */
  // get_logins();
  // function get_logins() {
  //   AdminUserApi.get_logins_by_user($scope.user._id)
  //     .then(res => {
  //       $scope.logins = res.data || [];
  //       $scope.loginCnt = $scope.logins.length;
  //       $scope.buildloginPager();
  //     })
  //     .catch(err => {
  //       alert(err.message);
  //     });
  // }
  // $scope.buildloginPager = () => {
  //   $scope.loginsPagedItems = [];
  //   $scope.loginsCurrentPage = 1;
  //   $scope.figureOutItemsToDisplay_logins();
  // };
  // $scope.figureOutItemsToDisplay_logins = function () {
  //   let filteredItems = $scope.logins;

  //   $scope.loginFilterLength = filteredItems.length;
  //   var begin = (($scope.loginsCurrentPage - 1) * $scope.itemsPerPage);
  //   var end = begin + $scope.itemsPerPage;
  //   $scope.loginsPagedItems = filteredItems.slice(begin, end);
  // };
  // $scope.loginPageChanged = function () {
  //   $scope.figureOutItemsToDisplay_logins();
  // };

  // /* Polls */
  // get_polls();
  // function get_polls() {
  //   AdminUserApi.get_polls_by_user($scope.user._id)
  //     .then(res => {
  //       $scope.polls = res.data || [];
  //       $scope.pollCnt = $scope.polls.length;
  //       $scope.likeCnt = count_total_like($scope.polls);
  //       $scope.buildPollPager();
  //     })
  //     .catch(err => {
  //       alert(err.message);
  //     });
  // }
  // $scope.buildPollPager = () => {
  //   $scope.pollsPagedItems = [];
  //   $scope.pollsCurrentPage = 1;
  //   $scope.figureOutItemsToDisplay_polls();
  // };
  // $scope.figureOutItemsToDisplay_polls = function () {
  //   let filteredItems = $filter('filter')($scope.polls, {
  //     $: $scope.pollSearch
  //   }) || [];

  //   $scope.pollFilterLength = filteredItems.length;
  //   var begin = (($scope.pollsCurrentPage - 1) * $scope.itemsPerPage);
  //   var end = begin + $scope.itemsPerPage;
  //   $scope.pollsPagedItems = filteredItems.slice(begin, end);
  // };
  // $scope.pollPageChanged = function () {
  //   $scope.figureOutItemsToDisplay_polls();
  // };
  // function count_total_like(polls) {
  //   var cnt = 0;
  //   polls.forEach(poll => {
  //     cnt += poll.likeCnt;
  //   });
  //   return cnt;
  // }

  // /* Comments */
  // get_cmts();
  // function get_cmts() {
  //   AdminUserApi.get_cmts_by_user($scope.user._id)
  //     .then(res => {
  //       $scope.cmts = res.data || [];
  //       $scope.cmtCnt = $scope.cmts.length;
  //       $scope.buildCmtPager();
  //     })
  //     .catch(err => {
  //       alert(err.message);
  //     });
  // }
  // $scope.buildCmtPager = () => {
  //   $scope.cmtsPagedItems = [];
  //   $scope.cmtsCurrentPage = 1;
  //   $scope.figureOutItemsToDisplay_cmts();
  // };
  // $scope.figureOutItemsToDisplay_cmts = function () {
  //   let filteredItems = $filter('filter')($scope.cmts, {
  //     $: $scope.cmtSearch
  //   }) || [];

  //   $scope.cmtFilterLength = filteredItems.length;
  //   var begin = (($scope.cmtsCurrentPage - 1) * $scope.itemsPerPage);
  //   var end = begin + $scope.itemsPerPage;
  //   $scope.cmtsPagedItems = filteredItems.slice(begin, end);
  // };
  // $scope.cmtPageChanged = function () {
  //   $scope.figureOutItemsToDisplay_cmts();
  // };

  // /* Votes */
  // get_votes();
  // function get_votes() {
  //   AdminUserApi.get_votes_by_user($scope.user._id)
  //     .then(res => {
  //       $scope.votes = res.data || [];
  //       $scope.voteCnt = $scope.votes.length;
  //       $scope.buildVotePager();
  //     })
  //     .catch(err => {
  //       alert(err.message);
  //     });
  // }
  // $scope.buildVotePager = () => {
  //   $scope.votesPagedItems = [];
  //   $scope.votesCurrentPage = 1;
  //   $scope.figureOutItemsToDisplay_votes();
  // };
  // $scope.figureOutItemsToDisplay_votes = function () {
  //   let filteredItems = $filter('filter')($scope.votes, {
  //     $: $scope.voteSearch
  //   }) || [];

  //   $scope.voteFilterLength = filteredItems.length;
  //   var begin = (($scope.votesCurrentPage - 1) * $scope.itemsPerPage);
  //   var end = begin + $scope.itemsPerPage;
  //   $scope.votesPagedItems = filteredItems.slice(begin, end);
  // };
  // $scope.votePageChanged = function () {
  //   $scope.figureOutItemsToDisplay_votes();
  // };

  // /* Reports */
  // get_reports();
  // function get_reports() {
  //   AdminUserApi.get_reports_by_user($scope.user._id)
  //     .then(res => {
  //       $scope.reports = res.data || [];
  //       $scope.reportCnt = $scope.reports.length;
  //       $scope.buildReportPager();
  //     })
  //     .catch(err => {
  //       alert(err.message);
  //     });
  // }
  // $scope.buildReportPager = () => {
  //   $scope.reportsPagedItems = [];
  //   $scope.reportsCurrentPage = 1;
  //   $scope.figureOutItemsToDisplay_reports();
  // };
  // $scope.figureOutItemsToDisplay_reports = function () {
  //   let filteredItems = $filter('filter')($scope.reports, {
  //     $: $scope.reportSearch
  //   }) || [];

  //   $scope.reportFilterLength = filteredItems.length;
  //   var begin = (($scope.reportsCurrentPage - 1) * $scope.itemsPerPage);
  //   var end = begin + $scope.itemsPerPage;
  //   $scope.reportsPagedItems = filteredItems.slice(begin, end);
  // };
  // $scope.reportPageChanged = function () {
  //   $scope.figureOutItemsToDisplay_reports();
  // };

  // /* Be reports */
  // get_bereports();
  // function get_bereports() {
  //   AdminUserApi.get_bereports_by_user($scope.user._id)
  //     .then(res => {
  //       $scope.bereports = res.data || [];
  //       $scope.bereportCnt = $scope.bereports.length;
  //       $scope.buildBereportPager();
  //     })
  //     .catch(err => {
  //       alert(err.message);
  //     });
  // }
  // $scope.buildBereportPager = () => {
  //   $scope.bereportsPagedItems = [];
  //   $scope.bereportsCurrentPage = 1;
  //   $scope.figureOutItemsToDisplay_bereports();
  // };
  // $scope.figureOutItemsToDisplay_bereports = function () {
  //   let filteredItems = $filter('filter')($scope.bereports, {
  //     $: $scope.bereportSearch
  //   }) || [];

  //   $scope.bereportFilterLength = filteredItems.length;
  //   var begin = (($scope.bereportsCurrentPage - 1) * $scope.itemsPerPage);
  //   var end = begin + $scope.itemsPerPage;
  //   $scope.bereportsPagedItems = filteredItems.slice(begin, end);
  // };
  // $scope.bereportPageChanged = function () {
  //   $scope.figureOutItemsToDisplay_bereports();
  // };


  // /* Suggested */
  // get_suggests();
  // function get_suggests() {
  //   AdminUserApi.get_suggests_by_user($scope.user._id)
  //     .then(res => {
  //       $scope.suggests = res.data || [];
  //       $scope.suggestCnt = $scope.suggests.length;
  //       $scope.buildSuggestPager();
  //     })
  //     .catch(err => {
  //       alert(err.message);
  //     });
  // }
  // $scope.buildSuggestPager = () => {
  //   $scope.suggestsPagedItems = [];
  //   $scope.suggestsCurrentPage = 1;
  //   $scope.figureOutItemsToDisplay_suggests();
  // };
  // $scope.figureOutItemsToDisplay_suggests = function () {
  //   let filteredItems = $filter('filter')($scope.suggests, {
  //     $: $scope.suggestSearch
  //   }) || [];

  //   $scope.suggestFilterLength = filteredItems.length;
  //   var begin = (($scope.suggestsCurrentPage - 1) * $scope.itemsPerPage);
  //   var end = begin + $scope.itemsPerPage;
  //   $scope.suggestsPagedItems = filteredItems.slice(begin, end);
  // };
  // $scope.suggestPageChanged = function () {
  //   $scope.figureOutItemsToDisplay_suggests();
  // };

  // $scope.remove = () => {
  //   if ($window.confirm('Delete this user?')) {
  //     $scope.user.$remove(function () {
  //       $state.go('admin.users.list');
  //     });
  //   }
  // };

  // $scope.handleDeletePoll = poll => {
  //   if ($window.confirm('Delete this poll?')) {
  //     var rs_poll = new Polls({ _id: poll._id });
  //     $scope.polls = _.without($scope.polls, poll);
  //     $scope.figureOutItemsToDisplay_polls();
  //     rs_poll.$remove();
  //   }
  // };
  // $scope.delete_cmt = cmt => {
  //   if ($window.confirm('Delete this comment?')) {
  //     var rs_cmt = new Cmts({ _id: cmt._id });
  //     $scope.cmts = _.without($scope.cmts, cmt);
  //     $scope.figureOutItemsToDisplay_cmts();
  //     rs_cmt.$remove();
  //   }
  // };
  // $scope.delete_vote = vote => {
  //   if ($window.confirm('Delete this vote?')) {
  //     var rs_vote = new Votes({ _id: vote._id });
  //     $scope.votes = _.without($scope.votes, vote);
  //     $scope.figureOutItemsToDisplay_votes();
  //     rs_vote.$remove();
  //   }
  // };
  // $scope.delete_report = rp => {
  //   if ($window.confirm('Delete this report?')) {
  //     var rs_rp = new Reports({ _id: rp._id });
  //     $scope.reports = _.without($scope.reports, rp);
  //     $scope.figureOutItemsToDisplay_reports();
  //     rs_rp.$remove();
  //   }
  // };
  // $scope.delete_bereport = brp => {
  //   if ($window.confirm('Delete this bereport?')) {
  //     var rs_brp = new Reports({ _id: brp._id });
  //     $scope.bereports = _.without($scope.bereports, brp);
  //     $scope.figureOutItemsToDisplay_bereports();
  //     rs_brp.$remove();
  //   }
  // };
  // $scope.delete_suggest = sg => {
  //   if ($window.confirm('Delete this bereport?')) {
  //     var rs_sg = new Opts({ _id: sg._id });
  //     $scope.suggests = _.without($scope.suggests, sg);
  //     $scope.figureOutItemsToDisplay_suggests();
  //     rs_sg.$remove();
  //   }
  // };
}