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
    'Action',
    'toastr',
    'ngDialog'
  ];

  function AdminPollsListController(
    $state,
    $scope,
    $window,
    Authentication,
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

    $scope.filter = {};

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
