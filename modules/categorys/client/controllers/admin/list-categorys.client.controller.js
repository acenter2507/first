(function () {
  'use strict';

  angular
    .module('categorys.admin')
    .controller('AdminCategorysListController', AdminCategorysListController);

  AdminCategorysListController.$inject = [
    '$scope',
    '$state',
    '$window',
    '$filter',
    'CategorysService',
    'Authentication',
    'toastr',
    'FileUploader'
  ];

  function AdminCategorysListController(
    $scope,
    $state,
    $window,
    $filter,
    CategorysService,
    Authentication,
    toast,
    FileUploader
  ) {
    var vm = this;
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
        search();
        category.$remove();
      }
    };
    $scope.uploader = new FileUploader();
    $scope.uploader.onAfterAddingAll = function (addedFileItems) {
      var file = addedFileItems[0]._file;
      var reader = new FileReader();
      reader.onload = function (progressEvent) {
        // By lines
        var rs_categorys;
        var lines = this.result.split('\n').map(function (item) {
          return item.trim();
        });
        lines.forEach(function (element) {
          if (element === '') return;
          var ctgrs = element.split(',').map(function (item) {
            return item.trim();
          });
          rs_categorys = new CategorysService({ name: ctgrs[0], icon: ctgrs[1], color: ctgrs[0] });
          console.log(rs_categorys);
          // rs_categorys.$save(res => {
          //   vm.categorys.push(res);
          // });
        });
      };
      reader.readAsText(file);
    };
    vm.import = () => {
      angular.element('#importFile').click();
    };
  }
}());
