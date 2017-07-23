'use strict';
angular.module('admin')
  .controller('UserListController', UserListController);
UserListController.$inject = ['$scope', '$filter', 'Admin', 'AdminApi', 'toastr', 'ngDialog'];

function UserListController($scope, $filter, Admin, AdminApi, toast, dialog) {
  Admin.query(function (data) {
    $scope.users = data;
    get_users_info().then(() => {
      $scope.buildPager();
    });
  });
  function get_users_info() {
    return new Promise((resolve, reject) => {
      var promise = [];
      $scope.users.forEach(user => {
        promise.push(get_user_report(user));
      });
      Promise.all(promise)
        .then(res => {
          return resolve();
        })
        .catch(err => {
          toast.error(err.message, 'Error!');
          return reject();
        });
    });
  }
  function get_user_report(user) {
    return new Promise((resolve, reject) => {
      AdminApi.user_report(user._id)
        .then(res => {
          user.report = res.data;
          return resolve();
        })
        .catch(err => {
          return reject();
        });
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

  $scope.filter_min = true;
}

