(function () {
  'use strict';

  angular
    .module('tags.admin')
    .controller('AdminTagsListController', AdminTagsListController);

  AdminTagsListController.$inject = ['TagsService', 'Authentication', '$filter'];

  function AdminTagsListController(TagsService, Authentication, $filter) {
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
