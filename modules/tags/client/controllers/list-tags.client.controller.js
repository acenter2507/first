(function () {
  'use strict';

  angular
    .module('tags')
    .controller('TagsListController', TagsListController);

  TagsListController.$inject = ['TagsService', 'Authentication'];

  function TagsListController(TagsService, Authentication) {
    var vm = this;
    vm.user = Authentication.user;
    vm.isLogged = (vm.user);

    vm.tags = TagsService.query();
  }
}());
