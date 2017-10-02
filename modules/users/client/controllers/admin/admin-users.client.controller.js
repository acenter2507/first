'use strict';
angular.module('users.admin')
  .controller('AdminUsersController', AdminUsersController);
AdminUsersController.$inject = ['$scope', '$filter', '$window', 'AdminUserService', 'AdminUserApi'];

function AdminUsersController($scope, $filter, $window, AdminUserService, AdminUserApi) {
  var vm = this;
  vm.users = [];
  vm.busy = false;
  vm.page = 1;
  vm.condition = {};
  vm.totalPage = 0;
  vm.totalUser = 0;
  vm.sort = '-created';

  onCreate();

  function onCreate() {
    handleLoadUsers();
  }
  /**
   * HANDLES
   */
  vm.handleLoadUsers = handleLoadUsers;
  function handleLoadUsers() {
    AdminUserApi.loadAdminUsers(vm.page, vm.condition)
      .success(res => {
        console.log(res);
        // vm.users = res.docs;
        // vm.totalPage = createArrayFromRange(res.pages);
        // vm.totalUser = res.total;
      })
      .error(err => {
        alert(err.message);
      });
  }

  vm.handleCreateTestUsers = () => {
    if (vm.busy) return;
    vm.busy = true;
    var numberOfUser = $window.prompt('Number of users to generate', 0);
    var passWord = $window.prompt('Password for all', '');
    AdminUserApi.generateUsers(numberOfUser, passWord).then(res => {
      vm.page = 1;
      handleLoadUsers();
      vm.busy = false;
    }).catch(err => {
      vm.busy = false;
      alert(err.message);
    });
  };

  vm.handleChangePage = page => {
    vm.page = page;
    handleLoadUsers();
  };

  vm.handleDeleteUser = user => {
    if ($window.confirm('Are you sure you want to delete?')) {
      var rs_user = new AdminUserService({ _id: user._id });
      rs_user.$remove(() => {
        $scope.users = _.without($scope.users, user);
        $scope.figureOutItemsToDisplay();
      });
    }
  };

  vm.handleClearCondition = () => {
    vm.condition = {};
    handleLoadUsers();
  };

  function createArrayFromRange(range) {
    var array = [];
    for (var i = 1; i <= range; i++) {
      array.push(i);
    }
    return array;
  }

  // $scope.buildPager = function () {
  //   $scope.pagedItems = [];
  //   $scope.itemsPerPage = 15;
  //   $scope.currentPage = 1;
  //   $scope.filter = {};
  //   $scope.figureOutItemsToDisplay();
  // };

  // $scope.figureOutItemsToDisplay = function () {
  //   $scope.filteredItems = $filter('users_filter')($scope.users, $scope.filter);
  //   $scope.filterLength = $scope.filteredItems.length;
  //   var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
  //   var end = begin + $scope.itemsPerPage;
  //   $scope.pagedItems = $scope.filteredItems.slice(begin, end);
  // };

  // $scope.pageChanged = function () {
  //   $scope.figureOutItemsToDisplay();
  // };

  // $scope.clear_filter = () => {
  //   $scope.filter = {};
  //   $scope.figureOutItemsToDisplay();
  // };
}

