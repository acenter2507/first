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
    'FileUploader'
  ];

  function AdminCategorysListController(
    $scope,
    $state,
    $window,
    $filter,
    CategorysService,
    FileUploader
  ) {
    var vm = this;
    if (!$scope.isAdmin) {
      $state.go('home');
    }

    buildPage();
    initChart();
    
    function buildPage() {
      vm.searchKey = '';
      vm.shows = [];
      search();
    }
    vm.search = search;
    function search() {
      vm.shows = $filter('filter')($scope.Categorys.list, {
        $: vm.searchKey
      });
    }

    // Chart
    function initChart() {
      $scope.chart = { options: { responsive: true } };
      $scope.chart.labels = _.pluck($scope.Categorys.list, 'name');
      $scope.chart.data = _.pluck($scope.Categorys.list, 'count');
      $scope.chart.colors = _.pluck($scope.Categorys.list, 'color');
    }

    $scope.remove = category => {
      if ($window.confirm('Are you sure you want to delete?')) {
        $scope.Categorys.remove(category);
        search();
      }
    };
    $scope.uploader = new FileUploader();
    $scope.uploader.onAfterAddingAll = function (addedFileItems) {
      var file = addedFileItems[0]._file;
      var reader = new FileReader();
      reader.onload = function (progressEvent) {
        // By lines
        var rs_categorys;
        var promise = [];
        var lines = this.result.split('\n').map(function (item) {
          return item.trim();
        });
        lines.forEach(function (element) {
          if (element === '') return;
          var ctgrs = element.split(',').map(function (item) {
            return item.trim();
          });
          rs_categorys = new CategorysService({ name: ctgrs[0], icon: ctgrs[1], color: ctgrs[2] });
          promise.push(rs_categorys.$save());
        });
        Promise.all(promise)
          .then(_ctgrs => {
            $scope.Categorys.load();
          })
          .catch(err => {
            alert(err.message);
          });
      };
      reader.readAsText(file);
    };
    vm.import = () => {
      angular.element('#importFile').click();
    };
  }
}());
