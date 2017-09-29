'use strict';
angular.module('users.admin')
  .controller('AdminUsersController', AdminUsersController);
AdminUsersController.$inject = ['$scope', '$filter', '$window', 'AdminUserService', 'AdminUserApi'];

function AdminUsersController($scope, $filter, $window, AdminUserService, AdminUserApi) {
  var ctrl = this;
  ctrl.page = 0;
  ctrl.sort = '-created';

  onCreate();

  function onCreate() {
    prepareUsers();
  }
  function prepareUsers() {
    AdminUserApi.getUsers(ctrl.page, ctrl.sort)
      .success(res => {
        console.log(res);
        // $scope.users = res || [];
        // $scope.buildPager();
      })
      .error(err => {
        alert(err.message);
      });
  }






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
  ctrl.handleDeleteUser = user => {
    if ($window.confirm('Are you sure you want to delete?')) {
      var rs_user = new AdminUserService({ _id: user._id });
      rs_user.$remove(() => {
        $scope.users = _.without($scope.users, user);
        $scope.figureOutItemsToDisplay();
      });
    }
  };
}

