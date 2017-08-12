(function () {
  'use strict';

  angular
    .module('tags')
    .controller('TagsListController', TagsListController);

  TagsListController.$inject = ['TagsService', '$filter'];

  function TagsListController(TagsService, $filter) {
    var vm = this;

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
  }
}());
