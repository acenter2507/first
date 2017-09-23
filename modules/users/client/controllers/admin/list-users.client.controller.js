'use strict';
angular.module('users.admin')
  .controller('AdminUserListController', AdminUserListController);
  AdminUserListController.$inject = ['$scope', '$filter', '$window', 'Admin', 'AdminApi'];

function AdminUserListController($scope, $filter, $window, Admin, AdminApi) {
  $scope.busy = true;
  get_users();
  function get_users() {
    AdminApi.get_users()
      .then(res => {
        $scope.users = res.data;
        $scope.busy = false;
        $scope.buildPager();
      })
      .catch(err => {
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
    if ($scope.busy) return;
    $scope.busy = true;
    $scope.filteredItems = $filter('users_filter')($scope.users, $scope.filter);
    $scope.filterLength = $scope.filteredItems.length;
    var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
    var end = begin + $scope.itemsPerPage;
    $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    $scope.busy = false;
  };

  $scope.pageChanged = function () {
    $scope.figureOutItemsToDisplay();
  };

  $scope.clear_filter = () => {
    $scope.filter = {};
    $scope.figureOutItemsToDisplay();
  };
  $scope.remove = user => {
    if ($window.confirm('Are you sure you want to delete?')) {
      var rs_user = new Admin({ _id: user._id });
      rs_user.$remove(() => {
        $scope.users = _.without($scope.users, user);
        $scope.figureOutItemsToDisplay();
      });
    }
  };
}

