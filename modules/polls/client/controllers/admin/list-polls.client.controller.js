(function () {
  'use strict';
  angular
    .module('polls')
    .controller('AdminPollsListController', AdminPollsListController);

  AdminPollsListController.$inject = [
    '$state',
    '$scope',
    '$window',
    'Authentication',
    'AdminPollsService',
    'Action',
    'toastr',
    'ngDialog'
  ];

  function AdminPollsListController(
    $state,
    $scope,
    $window,
    Authentication,
    AdminPollsService,
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
    $scope.busy = false;

    $scope.search = () => {
      if ($scope.busy === true) return;
      $scope.busy = true;
      console.log($scope.condition);
      AdminPollsService.search($scope.condition)
        .then(res => {
          console.log(res.data);
          $scope.busy = false;
        })
        .catch(err => {
          console.log(err);
          $scope.busy = false;
        });
    };
    $scope.clear = () => {
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
