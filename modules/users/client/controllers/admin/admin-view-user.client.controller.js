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
  OptsService
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
  vm.handleDeleteOption = opt => {
    var rsOpt = new OptsService({ _id: opt._id });
    vm.suggests.data = _.without(vm.suggests.data, opt);
    rsOpt.$remove();
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

  //-------------- REPORTED
  vm.handleViewListReports = () => {
    if (vm.reports) {
      let reports = angular.element(document.getElementById('reports-table'));
      $document.scrollToElementAnimated(reports, 100);
    } else {
      vm.reports = {};
      vm.reports.page = 1;
      vm.reports.condition = {};
      handleLoadUserReports();
      return;
    }
  };
  vm.handleReportsPageChanged = page => {
    vm.reports.page = page;
    handleLoadUserReports();
  };
  function handleLoadUserReports() {
    AdminUserApi.loadAdminUserReports(vm.user._id, vm.reports.page, vm.reports.condition)
      .success(res => {
        vm.reports.data = res.docs;
        vm.reports.pages = createArrayFromRange(res.pages);
        vm.reports.total = res.total;
        vm.handleViewListReports();
      })
      .error(err => {
        alert(err.message);
        console.log(err);
      });
  }

  //-------------- BE REPORTED
  vm.handleViewListBeReports = () => {
    if (vm.bereports) {
      let bereports = angular.element(document.getElementById('bereports-table'));
      $document.scrollToElementAnimated(bereports, 100);
    } else {
      vm.bereports = {};
      vm.bereports.page = 1;
      vm.bereports.condition = {};
      handleLoadUserBeReports();
      return;
    }
  };
  vm.handleBeReportsPageChanged = page => {
    vm.bereports.page = page;
    handleLoadUserBeReports();
  };
  function handleLoadUserBeReports() {
    AdminUserApi.loadAdminUserBeReports(vm.user._id, vm.bereports.page, vm.bereports.condition)
      .success(res => {
        vm.bereports.data = res.docs;
        vm.bereports.pages = createArrayFromRange(res.pages);
        vm.bereports.total = res.total;
        vm.handleViewListBeReports();
      })
      .error(err => {
        alert(err.message);
        console.log(err);
      });
  }

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
      vm.user.status = 3;
      vm.user.$update(() => {
        alert('Done');
      });
    }
  };
  vm.handleUnBlockUser = () => {
    if ($window.confirm('Are you sure you want to unblock?')) {
      vm.user.status = 2;
      vm.user.$update(() => {
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

}