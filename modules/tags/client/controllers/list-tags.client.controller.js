(function () {
  'use strict';

  angular
    .module('tags')
    .controller('TagsListController', TagsListController);

  TagsListController.$inject = ['TagsService', 'Authentication', '$filter'];

  function TagsListController(TagsService, Authentication, $filter) {
    var vm = this;
    vm.user = Authentication.user;
    vm.isLogged = (vm.user);

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
