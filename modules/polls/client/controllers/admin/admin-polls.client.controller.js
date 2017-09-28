(function () {
  'use strict';
  angular
    .module('polls.admin')
    .controller('AdminPollsController', AdminPollsController);

    AdminPollsController.$inject = [
    '$state',
    '$scope',
    '$window',
    '$filter',
    'Storages',
    'Constants',
    'Authentication',
    'AdminPollsService',
    'PollsService',
    'Action'
  ];

  function AdminPollsController(
    $state,
    $scope,
    $window,
    $filter,
    Storages,
    Constants,
    Authentication,
    AdminPollsService,
    PollsService,
    Action
  ) {
    var vm = this;
    if (!$scope.isAdmin) {
      $state.go('home');
    }

    $scope.condition = {};
    $scope.filter = {};
    $scope.busy = false;
    $scope.polls = [];

    initFirstShow();
    function initFirstShow() {
      $scope.condition = JSON.parse(Storages.get_session(Constants.storages.admin_polls_condition, JSON.stringify({})));
      $scope.filter = JSON.parse(Storages.get_session(Constants.storages.admin_polls_fitler, JSON.stringify({})));
      $scope.currentPage = Storages.get_session(Constants.storages.admin_polls_page, 1);
      search();
    }
    $scope.search = search;
    function search() {
      if ($scope.busy === true) return;
      $scope.busy = true;
      AdminPollsService.search($scope.condition)
        .then(res => {
          $scope.polls = res.data;
          buildPager();
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
          $scope.busy = false;
        });
      Storages.set_session(Constants.storages.admin_polls_condition, JSON.stringify($scope.condition));
    }

    $scope.buildPager = buildPager;
    function buildPager() {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      figureOutItemsToDisplay();
      $scope.busy = false;
    }

    $scope.figureOutItemsToDisplay = figureOutItemsToDisplay;
    function figureOutItemsToDisplay() {
      Storages.set_session(Constants.storages.admin_polls_fitler, JSON.stringify($scope.filter));
      if ($scope.filter.local_sort) {
        $scope.filteredItems = $filter('orderBy')($scope.polls, $scope.filter.local_sort, false);
      } else {
        $scope.filteredItems = _.clone($scope.polls);
      }
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    }

    $scope.pageChanged = function () {
      Storages.set_session(Constants.storages.admin_polls_page, $scope.currentPage);
      figureOutItemsToDisplay();
    };
    $scope.remove = poll => {
      if ($window.confirm('Are you sure you want to delete?')) {
        var rs_poll = new PollsService({ _id: poll._id });
        rs_poll.$remove(() => {
          $scope.polls = _.without($scope.polls, poll);
          figureOutItemsToDisplay();
        });
      }
    };
    $scope.clear_filter = () => {
      $scope.condition = {};
      $scope.selectedUser = undefined;
      $scope.$broadcast('angucomplete-alt:clearInput');
    };
    $scope.clear_created_start = () => {
      delete $scope.condition.created_start;
    };
    $scope.clear_created_end = () => {
      delete $scope.condition.created_end;
    };
    $scope.selectedUserFn = (selected) => {
      if (selected) {
        $scope.condition.by = selected.originalObject._id;
        $scope.selectedUser = selected.originalObject;
      } else {
        $scope.condition.by = undefined;
        $scope.selectedUser = undefined;
      }
    };
  }
})();
