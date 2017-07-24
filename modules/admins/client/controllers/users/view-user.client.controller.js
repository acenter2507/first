'use strict';
angular.module('admin')
  .controller('ViewUserController', ViewUserController);
ViewUserController.$inject = ['$window', '$timeout', '$scope', '$state', 'Authentication', 'userResolve', 'AdminApi', 'Action', 'toastr', 'ngDialog'];


function ViewUserController($window, $timeout, $scope, $state, Authentication, userResolve, AdminApi, Action, toast, dialog) {
  $scope.authentication = Authentication;
  $scope.user = userResolve;
  $scope.itemsPerPage = 15;

  /* User basic info control */
  $scope.filter_min = true;

  /* Polls */
  function get_polls() {
    AdminApi.get_polls_by_user($scope.user._id)
      .then(res => {
        $scope.polls = res.data || [];
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
    $scope.$apply();
  };
  $scope.figureOutItemsToDisplay_polls = function () {
    let filteredItems = $filter('filter')($scope.users, {
      $: $scope.pollSearch
    });

    let filterLength = filteredItems.length;
    var begin = (($scope.pollsCurrentPage - 1) * $scope.itemsPerPage);
    var end = begin + $scope.itemsPerPage;
    $scope.pollsPagedItems = filteredItems.slice(begin, end);
  };

  $scope.pollPageChanged = function () {
    $scope.figureOutItemsToDisplay_polls();
  };

  

  $scope.remove = function (user) {
    if (confirm('Are you sure you want to delete this user?')) {
      if (user) {
        user.$remove();

        $scope.users.splice($scope.users.indexOf(user), 1);
      } else {
        $scope.user.$remove(function () {
          $state.go('admin.users.list');
        });
      }
    }
  };
}
