(function () {
  'use strict';

  angular
    .module('tags.admin')
    .controller('AdminTagsListController', AdminTagsListController);

  AdminTagsListController.$inject = [
    '$scope',
    '$state',
    '$window',
    '$filter',
    'TagsService',
    'Authentication',
    'toastr'
  ];

  function AdminTagsListController(
    $scope,
    $state,
    $window,
    $filter,
    TagsService,
    Authentication,
    toast
  ) {
    var vm = this;
    if (!$scope.isAdmin) {
      $state.go('home');
    }

    var promise = TagsService.query().$promise;
    promise.then(_tags => {
      vm.tags = _tags || [];
    });

    TagsService.query().$promise
      .then(tags => {
        vm.tags = tags;
        buildPage();
      });
    function buildPage() {
      vm.searchKey = '';
      vm.shows = [];
      search();
    }
    vm.search = search;
    function search() {
      vm.shows = $filter('filter')(vm.tags, {
        $: vm.searchKey
      });
    }

    $scope.remove = tag => {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.tags = _.without(vm.tags, tag);
        search();
        tag.$remove();
      }
    };
  }
}());
