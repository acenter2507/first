(function () {
  'use strict';

  angular
    .module('categorys.admin')
    .controller('AdminCategorysListController', AdminCategorysListController);

  AdminCategorysListController.$inject = [
    '$scope',
    '$state',
    '$window',
    'CategorysService',
    'Authentication',
    'toastr'
  ];

  function AdminCategorysListController(
    $scope,
    $state,
    $window,
    CategorysService,
    Authentication,
    toast
  ) {
    var vm = this;
    $scope.user = Authentication.user;
    $scope.isAdmin = _.contains($scope.user.roles, 'admin');
    if (!$scope.isAdmin) {
      $state.go('home');
    }

    var promise = CategorysService.query().$promise;
    promise.then(_categorys => {
      vm.categorys = _categorys || [];
      buildPage();
      initChart();
    });
    function buildPage() {
      vm.searchKey = '';
      vm.shows = [];
      search();
    }
    vm.search = search;
    function search() {
      vm.shows = $filter('filter')(vm.categorys, {
        $: vm.searchKey
      });
    }

    // Chart
    function initChart() {
      $scope.chart = { options: { responsive: true } };
      $scope.chart.labels = _.pluck(vm.categorys, 'name');
      $scope.chart.data = _.pluck(vm.categorys, 'count');
      $scope.chart.colors = _.pluck(vm.categorys, 'color');
    }

    $scope.remove = category => {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.categorys = _.without(vm.categorys, category);
        category.$remove();
      }
    };
  }
}());
