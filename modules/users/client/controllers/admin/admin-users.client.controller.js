'use strict';
angular.module('users.admin')
  .controller('AdminUsersController', AdminUsersController);
AdminUsersController.$inject = ['$scope', '$filter', '$window', 'AdminUserService', 'AdminUserApi'];

function AdminUsersController($scope, $filter, $window, AdminUserService, AdminUserApi) {
  var vm = this;
  vm.users = [];
  vm.busy = false;
  vm.page = 1;
  vm.sort = '-created';

  onCreate();

  function onCreate() {
    prepareUsers();
  }
  function prepareUsers() {
    AdminUserApi.loadAdminUsers(vm.page, vm.sort)
      .success(res => {
        console.log(res);
        // $scope.users = res || [];
        // $scope.buildPager();
      })
      .error(err => {
        alert(err.message);
      });
  }

  /**
   * HANDLES
   */
  vm.handleCreateTestUsers = () => {
    if (vm.busy) return;
    vm.busy = true;
    var numberOfUser = $window.prompt('Number of users to generate', 0);
    var passWord = $window.prompt('Password for all', '');
    AdminUserApi.generateUsers(numberOfUser, passWord).then(res => {
      console.log(res);
      vm.page = 1;
      prepareUsers();
      vm.busy = false;
    }).catch(err => {
      vm.busy = false;
      alert(err.message);
      console.log(err);
    });
  };




  $scope.buildPager = function () {
    $scope.pagedItems = [];
    $scope.itemsPerPage = 15;
    $scope.currentPage = 1;
    $scope.filter = {};
    $scope.figureOutItemsToDisplay();
  };

  $scope.figureOutItemsToDisplay = function () {
    $scope.filteredItems = $filter('users_filter')($scope.users, $scope.filter);
    $scope.filterLength = $scope.filteredItems.length;
    var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
    var end = begin + $scope.itemsPerPage;
    $scope.pagedItems = $scope.filteredItems.slice(begin, end);
  };

  $scope.pageChanged = function () {
    $scope.figureOutItemsToDisplay();
  };

  $scope.clear_filter = () => {
    $scope.filter = {};
    $scope.figureOutItemsToDisplay();
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
}

