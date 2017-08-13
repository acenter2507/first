(function () {
  'use strict';
  angular
    .module('polls')
    .controller('AdminPollsListController', AdminPollsListController);

  AdminPollsListController.$inject = [
    '$state',
    '$scope',
    '$window',
    '$filter',
    'Storages',
    'Constants',
    'Authentication',
    'AdminPollsService',
    'PollsService',
    'Action',
    'toastr',
    'ngDialog'
  ];

  function AdminPollsListController(
    $state,
    $scope,
    $window,
    $filter,
    Storages,
    Constants,
    Authentication,
    AdminPollsService,
    PollsService,
    Action,
    toast,
    dialog
  ) {
    var vm = this;
    $scope.user = Authentication.user;
    $scope.isLogged = ($scope.user);
    $scope.isAdmin = _.contains($scope.user.roles, 'admin');
    if (!$scope.isAdmin) {
      $state.go('home');
    }

    $scope.condition = {};
    $scope.filter = {};
    $scope.busy = false;
    $scope.polls = [];

    initFirstShow();
    function initFirstShow() {
      $scope.condition = JSON.parse(Storages.get_session(Constants.storages.admin_polls_condition, JSON.stringify({
        created_start: new moment(new Date(), 'YYYY/MM/DD').subtract(1, 'days').format()
      })));
      $scope.filter = JSON.parse(Storages.get_session(Constants.storages.admin_polls_fitler, JSON.stringify({})));
      $scope.currentPage = Storages.get_session(Constants.storages.admin_polls_page, 1);
      search();
    }
    $scope.search = search;
    function search() {
      if ($scope.busy === true) return;
      $scope.busy = true;
      Storages.set_session(Constants.storages.admin_polls_condition, JSON.stringify($scope.condition));
      AdminPollsService.search($scope.condition)
        .then(res => {
          $scope.polls = res.data;
          buildPager();
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
          $scope.busy = false;
          console.log(err);
        });
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
          toast.success('You have deleted: ' + poll.title, 'Success!');
        });
      }
    };
    $scope.clear_filter = () => {
      $scope.condition = {};
      $scope.selectedUser = undefined;
      $scope.$broadcast('angucomplete-alt:clearInput');
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
    get_categorys();
    function get_categorys() {
      Action.get_categorys()
        .then(res => {
          $scope.categorys = res;
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
        });
    }
  }
})();
